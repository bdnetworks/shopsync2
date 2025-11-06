
import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig } from '@/config/site';
import type { CartItem } from '@/lib/types';
import nodemailer from 'nodemailer';

// This interface should match the one in checkout page
interface OrderDetailsForConfirmation {
  orderId: string;
  customer: { name: string; email: string; mobile: string; address: string; };
  items: CartItem[];
  summary: {
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    paymentMethod: string;
    paymentDetails?: string;
    couponCode?: string;
  };
  orderDate: string;
}

// Reusable Nodemailer transport
async function sendEmail({ to, subject, bodyHtml, replyTo, siteName, gmailUser }: { to: string, subject: string, bodyHtml: string, replyTo?: string, siteName: string, gmailUser: string }) {
    const gmailPass = process.env.GMAIL_PASS;

    if (!gmailUser || !gmailPass || gmailUser === 'your-email@gmail.com') {
        // Silently fail if not configured, but log for the server admin.
        console.warn('Email service is not configured. Skipping email sending.');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
        from: `"${siteName}" <${gmailUser}>`,
        to,
        subject,
        html: bodyHtml,
        replyTo,
    });
}

// Email generation functions (could be moved to a separate file if they grow)
function generateCustomerEmail(details: OrderDetailsForConfirmation, siteConfig: any): string {
    const itemsHtml = details.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                <img src="${item.image.src}" alt="${item.image.alt}" width="50" style="vertical-align: middle; margin-right: 10px;"/>
                ${item.name} (x${item.quantity})
                ${(item.selectedColor || item.selectedSize) ? `<br/><small style='color:#555'>${item.selectedColor ? `Color: ${item.selectedColor}` : ''}${item.selectedColor && item.selectedSize ? ', ' : ''}${item.selectedSize ? `Size: ${item.selectedSize}` : ''}</small>` : ''}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${siteConfig.currency}${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h1 style="color: #1a1a1a; text-align: center;">Thank you for your order, ${details.customer.name}!</h1>
            <p>We've received your order and will process it shortly. Here are the details:</p>
            <h2 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Order #${details.orderId}</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 10px; background-color: #f7f7f7;">Item</th>
                        <th style="text-align: right; padding: 10px; background-color: #f7f7f7;">Price</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot>
                    <tr><td colspan="2" style="padding: 5px;"></td></tr>
                    <tr><td style="padding: 10px; text-align: right;">Subtotal:</td><td style="padding: 10px; text-align: right;">${siteConfig.currency}${details.summary.subtotal.toFixed(2)}</td></tr>
                    ${details.summary.discount > 0 ? `<tr><td style="padding: 10px; text-align: right;">Discount:</td><td style="padding: 10px; text-align: right; color: green;">-${siteConfig.currency}${details.summary.discount.toFixed(2)}</td></tr>` : ''}
                    <tr><td style="padding: 10px; text-align: right;">Shipping:</td><td style="padding: 10px; text-align: right;">${siteConfig.currency}${details.summary.shippingFee.toFixed(2)}</td></tr>
                    <tr style="font-weight: bold;"><td style="padding: 10px; text-align: right; border-top: 2px solid #eee;">Total:</td><td style="padding: 10px; text-align: right; border-top: 2px solid #eee;">${siteConfig.currency}${details.summary.total.toFixed(2)}</td></tr>
                </tfoot>
            </table>
            <h3 style="margin-top: 30px; border-top: 2px solid #eee; padding-top: 20px;">Shipping Address</h3>
            <p style="background-color: #f7f7f7; padding: 15px; border-radius: 5px;">${details.customer.name}<br>${details.customer.address}<br>${details.customer.mobile}</p>
            <h3 style="margin-top: 20px;">Payment Method</h3>
            <p><strong>${details.summary.paymentMethod}</strong></p>
            ${details.summary.paymentDetails && details.summary.paymentMethod !== 'CASH ON DELIVERY' ? `<p style="background-color: #fffbe6; padding: 15px; border-left: 4px solid #facc15; margin-top: 10px;"><strong>Instructions:</strong> ${details.summary.paymentDetails}</p>` : ''}
            <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #888;">Thanks for shopping with us!<br>${siteConfig.name}</p>
        </div>
    `;
}

function generateAdminEmail(details: OrderDetailsForConfirmation, siteConfig: any): string {
    const itemsHtml = details.items.map(item => `
       <li style="margin-bottom: 10px;">
        ${item.name} (ID: ${item.id}) - Qty: ${item.quantity} - Price: ${siteConfig.currency}${item.price.toFixed(2)}
        ${(item.selectedColor || item.selectedSize) ? `<br/><small style='color:#555'>${item.selectedColor ? `Color: ${item.selectedColor}` : ''}${item.selectedColor && item.selectedSize ? ', ' : ''}${item.selectedSize ? `Size: ${item.selectedSize}` : ''}</small>` : ''}
       </li>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif;">
            <h1>New Order Received! (#${details.orderId})</h1>
            <p>A new order has been placed on <strong>${siteConfig.name}</strong>.</p>
            <h3>Customer Details:</h3>
            <ul>
                <li><strong>Name:</strong> ${details.customer.name}</li>
                <li><strong>Email:</strong> ${details.customer.email}</li>
                <li><strong>Mobile:</strong> ${details.customer.mobile}</li>
                <li><strong>Address:</strong> ${details.customer.address}</li>
            </ul>
            <h3>Order Items:</h3><ul>${itemsHtml}</ul>
            <h3>Order Summary:</h3>
            <ul>
                <li><strong>Subtotal:</strong> ${siteConfig.currency}${details.summary.subtotal.toFixed(2)}</li>
                ${details.summary.discount > 0 ? `<li><strong>Discount (${details.summary.couponCode}):</strong> -${siteConfig.currency}${details.summary.discount.toFixed(2)}</li>` : ''}
                <li><strong>Shipping Fee:</strong> ${siteConfig.currency}${details.summary.shippingFee.toFixed(2)}</li>
                <li><strong>Total:</strong> ${siteConfig.currency}${details.summary.total.toFixed(2)}</li>
                <li><strong>Payment Method:</strong> ${details.summary.paymentMethod}</li>
                 ${details.summary.paymentDetails && details.summary.paymentMethod !== 'CASH ON DELIVERY' ? `<li><strong>Payment Instructions:</strong> ${details.summary.paymentDetails}</li>` : ''}
            </ul>
        </div>
    `;
}


export async function POST(req: NextRequest) {
  const { orderForSheet, orderDetailsForConfirmation } = await req.json();
  const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;

  if (!googleScriptUrl) {
    return NextResponse.json({ error: 'Google Script URL is not configured.' }, { status: 500 });
  }

  try {
    // 1. Fetch site config
    const siteConfig = await getSiteConfig();
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;
    const adminEmail = siteConfig.email;
    
    // 2. Post to Google Sheet and Send Emails in parallel
    const sheetPromise = fetch(googleScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderForSheet),
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });

    const emailPromises: Promise<any>[] = [];
    
    // Only attempt to send emails if credentials are provided
    if (gmailUser && gmailUser !== 'your-email@gmail.com' && gmailPass && adminEmail) {
        // Customer Email
        const customerEmailBody = generateCustomerEmail(orderDetailsForConfirmation, siteConfig);
        emailPromises.push(
            sendEmail({
                to: orderDetailsForConfirmation.customer.email,
                subject: `Your Order Confirmation from ${siteConfig.name} (#${orderDetailsForConfirmation.orderId})`,
                bodyHtml: customerEmailBody,
                siteName: siteConfig.name,
                gmailUser: gmailUser
            }).catch(e => console.error("Failed to send customer email:", e)) // prevent email failure from stopping the whole process
        );
        // Admin Email
        const adminEmailBody = generateAdminEmail(orderDetailsForConfirmation, siteConfig);
        emailPromises.push(
            sendEmail({
                to: adminEmail,
                subject: `[${siteConfig.name}] New Order Received! (#${orderDetailsForConfirmation.orderId})`,
                bodyHtml: adminEmailBody,
                replyTo: orderDetailsForConfirmation.customer.email,
                siteName: siteConfig.name,
                gmailUser: gmailUser
            }).catch(e => console.error("Failed to send admin email:", e)) // prevent email failure from stopping the whole process
        );
    } else {
        console.warn("Email service is not configured. Skipping email sending.");
    }

    const [sheetResponse] = await Promise.allSettled([sheetPromise, ...emailPromises]);

    // Handle sheet response - it's the primary critical path
    if (sheetResponse.status === 'rejected' || !sheetResponse.value.ok) {
        const errorMsg = sheetResponse.status === 'rejected' 
            ? sheetResponse.reason.message 
            : `Failed to post data to Google Sheet. Status: ${sheetResponse.value.status}`;
        
        throw new Error(errorMsg);
    }
    
    return NextResponse.json({ status: 'success', message: 'Order successfully submitted.' });

  } catch (error: any) {
    console.error('Error in order submission process:', error);
    if (error.name === 'TimeoutError') {
        return NextResponse.json({ error: 'Request to Google Sheet timed out.', details: error.message }, { status: 504 });
    }
    return NextResponse.json({ error: 'Failed to process order.', details: error.message }, { status: 500 });
  }
}

    