import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';

interface OrderDetails {
    orderId: string;
    customer: {
        name: string;
        email: string;
        mobile: string;
        address: string;
    };
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number;
        image: { src: string; alt: string; };
    }[];
    summary: {
        subtotal: number;
        shippingFee: number;
        total: number;
        paymentMethod: string;
        paymentDetails?: string;
    };
    orderDate: string;
}

async function sendElasticEmail({ to, subject, bodyHtml, replyTo }: { to: string, subject: string, bodyHtml: string, replyTo?: string }) {
    const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
    const fromEmail = "saakib.com@gmail.com"; // Must be a verified sender

    if (!apiKey) {
        throw new Error('Elastic Email API Key is not configured.');
    }

    const formData = new URLSearchParams();
    formData.append('apikey', apiKey);
    formData.append('subject', subject);
    formData.append('from', fromEmail);
    formData.append('fromName', siteConfig.name);
    if (replyTo) {
        formData.append('replyTo', replyTo);
    }
    formData.append('to', to);
    formData.append('bodyHtml', bodyHtml);
    formData.append('isTransactional', 'true');

    const response = await fetch('https://api.elasticemail.com/v2/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });

    const result = await response.json();
    if (!result.success) {
        console.error(`Elastic Email API Error for ${to}:`, result.error);
        throw new Error(result.error || 'Failed to send email.');
    }
    return result;
}

function generateCustomerEmail(details: OrderDetails): string {
    const itemsHtml = details.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name} (x${item.quantity})</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${siteConfig.currency}${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #1a1a1a;">Thank you for your order, ${details.customer.name}!</h1>
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
                    <tr>
                        <td style="padding: 10px; text-align: right;">Subtotal:</td>
                        <td style="padding: 10px; text-align: right;">${siteConfig.currency}${details.summary.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; text-align: right;">Shipping:</td>
                        <td style="padding: 10px; text-align: right;">${siteConfig.currency}${details.summary.shippingFee.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold;">${siteConfig.currency}${details.summary.total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            <h3 style="margin-top: 20px;">Shipping Address</h3>
            <p>
                ${details.customer.name}<br>
                ${details.customer.address}<br>
                ${details.customer.mobile}
            </p>
            <h3 style="margin-top: 20px;">Payment Method</h3>
            <p>${details.summary.paymentMethod}</p>
            ${details.summary.paymentDetails && details.summary.paymentMethod !== 'CASH ON DELIVERY' ? `<p><strong>Instructions:</strong> ${details.summary.paymentDetails}</p>` : ''}
            <p style="margin-top: 20px;">Thanks for shopping with us!</p>
        </div>
    `;
}

function generateAdminEmail(details: OrderDetails): string {
    const itemsHtml = details.items.map(item => `
       <li>${item.name} (ID: ${item.id}) - Quantity: ${item.quantity} - Price: ${siteConfig.currency}${item.price.toFixed(2)}</li>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif;">
            <h1>New Order Received!</h1>
            <h2>Order ID: ${details.orderId}</h2>
            <p>A new order has been placed on your website.</p>
            
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
            </ul>
        </div>
    `;
}


export async function POST(req: NextRequest) {
  try {
    const orderDetails: OrderDetails = await req.json();
    const adminEmail = "saakib.com@gmail.com";

    // 1. Send confirmation email to the customer
    const customerEmailBody = generateCustomerEmail(orderDetails);
    const customerEmailPromise = sendElasticEmail({
        to: orderDetails.customer.email,
        subject: `Your Order Confirmation from ${siteConfig.name} (#${orderDetails.orderId})`,
        bodyHtml: customerEmailBody,
    });

    // 2. Send notification email to the admin
    const adminEmailBody = generateAdminEmail(orderDetails);
    const adminEmailPromise = sendElasticEmail({
        to: adminEmail,
        subject: `New Order Received! (#${orderDetails.orderId})`,
        bodyHtml: adminEmailBody,
        replyTo: orderDetails.customer.email,
    });

    // Wait for both emails to be sent
    await Promise.all([customerEmailPromise, adminEmailPromise]);
    
    return NextResponse.json({ success: true, message: 'Order confirmation emails sent successfully!' });

  } catch (error: any) {
    console.error('Error processing order email:', error);
    return NextResponse.json({ error: 'Failed to send order emails.', details: error.message }, { status: 500 });
  }
}
