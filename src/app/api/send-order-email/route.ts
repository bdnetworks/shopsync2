
import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig } from '@/config/site';
import type { CartItem } from '@/lib/types';
import nodemailer from 'nodemailer';

interface OrderDetails {
    orderId: string;
    customer: {
        name: string;
        email: string;
        mobile: string;
        address: string;
    };
    items: CartItem[];
    summary: {
        subtotal: number;
        shippingFee: number;
        total: number;
        paymentMethod: string;
        paymentDetails?: string;
    };
    orderDate: string;
}

// Reusable function to send email via Nodemailer
async function sendNodemailerEmail({ 
    to, 
    subject, 
    bodyHtml, 
    replyTo,
    siteName,
    gmailUser
}: { 
    to: string, 
    subject: string, 
    bodyHtml: string, 
    replyTo?: string,
    siteName: string,
    gmailUser: string
}) {
    const gmailPass = process.env.GMAIL_PASS;

    if (!gmailUser || !gmailPass || gmailUser === 'your-email@gmail.com') {
        throw new Error('Email service is not configured. Please set up GMAIL_USER and GMAIL_PASS in your environment variables.');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass, // Use the App Password here
        },
    });

    const mailOptions: nodemailer.SendMailOptions = {
        from: `"${siteName}" <${gmailUser}>`,
        to: to,
        subject: subject,
        html: bodyHtml,
    };

    if (replyTo) {
        mailOptions.replyTo = replyTo;
    }

    await transporter.sendMail(mailOptions);
}

function generateCustomerEmail(details: OrderDetails, siteConfig: any): string {
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
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr><td colspan="2" style="padding: 5px;"></td></tr>
                    <tr>
                        <td style="padding: 10px; text-align: right;">Subtotal:</td>
                        <td style="padding: 10px; text-align: right;">${siteConfig.currency}${details.summary.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; text-align: right;">Shipping:</td>
                        <td style="padding: 10px; text-align: right;">${siteConfig.currency}${details.summary.shippingFee.toFixed(2)}</td>
                    </tr>
                    <tr style="font-weight: bold;">
                        <td style="padding: 10px; text-align: right; border-top: 2px solid #eee;">Total:</td>
                        <td style="padding: 10px; text-align: right; border-top: 2px solid #eee;">${siteConfig.currency}${details.summary.total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            <h3 style="margin-top: 30px; border-top: 2px solid #eee; padding-top: 20px;">Shipping Address</h3>
            <p style="background-color: #f7f7f7; padding: 15px; border-radius: 5px;">
                ${details.customer.name}<br>
                ${details.customer.address}<br>
                ${details.customer.mobile}
            </p>
            <h3 style="margin-top: 20px;">Payment Method</h3>
            <p><strong>${details.summary.paymentMethod}</strong></p>
            ${details.summary.paymentDetails && details.summary.paymentMethod !== 'CASH ON DELIVERY' ? `<p style="background-color: #fffbe6; padding: 15px; border-left: 4px solid #facc15; margin-top: 10px;"><strong>Instructions:</strong> ${details.summary.paymentDetails}</p>` : ''}
            <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #888;">Thanks for shopping with us!<br>${siteConfig.name}</p>
        </div>
    `;
}

function generateAdminEmail(details: OrderDetails, siteConfig: any): string {
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
            
            <h3>Order Items:</h3>
            <ul>
                ${itemsHtml}
            </ul>
            
            <h3>Order Summary:</h3>
            <ul>
                <li><strong>Subtotal:</strong> ${siteConfig.currency}${details.summary.subtotal.toFixed(2)}</li>
                <li><strong>Shipping Fee:</strong> ${siteConfig.currency}${details.summary.shippingFee.toFixed(2)}</li>
                <li><strong>Total:</strong> ${siteConfig.currency}${details.summary.total.toFixed(2)}</li>
                <li><strong>Payment Method:</strong> ${details.summary.paymentMethod}</li>
                 ${details.summary.paymentDetails && details.summary.paymentMethod !== 'CASH ON DELIVERY' ? `<li><strong>Payment Instructions:</strong> ${details.summary.paymentDetails}</li>` : ''}
            </ul>
        </div>
    `;
}

export async function POST(req: NextRequest) {
  try {
    const orderDetails: OrderDetails = await req.json();
    const siteConfig = await getSiteConfig();

    const gmailUser = process.env.GMAIL_USER;
    const adminEmail = siteConfig.email;

    if (!adminEmail) {
        throw new Error('Admin email is not configured.');
    }
    if (!gmailUser) {
        throw new Error('Gmail sending email (GMAIL_USER) is not configured in environment variables.');
    }

    // 1. Send confirmation email to the customer
    const customerEmailBody = generateCustomerEmail(orderDetails, siteConfig);
    const customerEmailPromise = sendNodemailerEmail({
        to: orderDetails.customer.email,
        subject: `Your Order Confirmation from ${siteConfig.name} (#${orderDetails.orderId})`,
        bodyHtml: customerEmailBody,
        siteName: siteConfig.name,
        gmailUser: gmailUser
    });

    // 2. Send notification email to the admin
    const adminEmailBody = generateAdminEmail(orderDetails, siteConfig);
    const adminEmailPromise = sendNodemailerEmail({
        to: adminEmail,
        subject: `[${siteConfig.name}] New Order Received! (#${orderDetails.orderId})`,
        bodyHtml: adminEmailBody,
        replyTo: orderDetails.customer.email,
        siteName: siteConfig.name,
        gmailUser: gmailUser
    });

    // Wait for both emails to be sent successfully
    await Promise.all([customerEmailPromise, adminEmailPromise]);
    
    return NextResponse.json({ success: true, message: 'Order confirmation emails sent successfully!' });

  } catch (error: any) {
    console.error('Error processing order email:', error);
    // Return a more detailed error to the client for debugging
    return NextResponse.json({ error: 'Failed to send order emails.', details: error.message }, { status: 500 });
  }
}
