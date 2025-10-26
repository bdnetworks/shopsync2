
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { render } from '@react-email/render';
import OrderReceiptEmail from '@/emails/order-receipt';
import type { CartItem } from '@/lib/types';
import { siteConfig } from '@/config/site';
import sgMail from '@sendgrid/mail';

const CustomerDetailsSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
});

const CartItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.string(),
    unit: z.string().optional(),
    image: z.object({
        id: z.string(),
        src: z.string(),
        alt: z.string(),
        hint: z.string(),
    }),
    quantity: z.number(),
});

const CartDetailsSchema = z.object({
  items: z.array(CartItemSchema),
  subtotal: z.number(),
  shipping: z.number(),
  total: z.number(),
});

export const SendOrderEmailInputSchema = z.object({
  customerDetails: CustomerDetailsSchema,
  cartDetails: CartDetailsSchema,
});

export type SendOrderEmailInput = z.infer<typeof SendOrderEmailInputSchema>;

export async function sendOrderEmail(input: SendOrderEmailInput): Promise<void> {
  return sendOrderEmailFlow(input);
}

const sendOrderEmailFlow = ai.defineFlow(
  {
    name: 'sendOrderEmailFlow',
    inputSchema: SendOrderEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY is not set. Email will be logged to console instead of sent.");
      
      const emailHtml = render(
        OrderReceiptEmail({
          customerName: input.customerDetails.name,
          shippingAddress: input.customerDetails.address,
          orderItems: input.cartDetails.items as CartItem[],
          orderTotal: input.cartDetails.total,
          siteName: siteConfig.name,
          siteContactEmail: siteConfig.contactInfo.find(c => c.title === 'Email')?.value || '',
        })
      );
      
      console.log('--- SIMULATING SENDING ORDER EMAIL ---');
      console.log(`To: ${siteConfig.checkout.contact.email}`);
      console.log('--- HTML BODY ---');
      console.log(emailHtml.substring(0, 500) + '...');
      console.log('--- END OF SIMULATION ---');
      
      // Since we are simulating, we throw an error for the user to know it's not configured.
      throw new Error("Email sending is not configured. Please set SENDGRID_API_KEY in your environment variables.");
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const emailHtml = render(
      OrderReceiptEmail({
        customerName: input.customerDetails.name,
        shippingAddress: input.customerDetails.address,
        orderItems: input.cartDetails.items as CartItem[],
        orderTotal: input.cartDetails.total,
        siteName: siteConfig.name,
        siteContactEmail: siteConfig.contactInfo.find(c => c.title === 'Email')?.value || '',
      })
    );

    const msg = {
      to: siteConfig.checkout.contact.email, // The store owner's email
      from: `noreply@${siteConfig.name.toLowerCase().replace(/\s/g, '')}.com`,
      subject: `New Order Received from ${input.customerDetails.name}`,
      html: emailHtml,
    };

    try {
      await sgMail.send(msg);
      console.log('Order email sent successfully');
    } catch (error) {
      console.error('Error sending order email:', error);
      // In case of error, re-throw to be handled by the caller
      throw new Error('Failed to send order email.');
    }
  }
);

