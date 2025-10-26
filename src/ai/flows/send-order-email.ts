
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { render } from '@react-email/render';
import OrderReceiptEmail from '@/emails/order-receipt';
import type { CartItem } from '@/lib/types';
import { siteConfig } from '@/config/site';

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
    
    // In a real application, you would use a service like Nodemailer or Resend
    // to actually send the email. For this example, we'll just render the email
    // and log it to the console to simulate the email sending process.
    
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

    const emailText = render(
        OrderReceiptEmail({
          customerName: input.customerDetails.name,
          shippingAddress: input.customerDetails.address,
          orderItems: input.cartDetails.items as CartItem[],
          orderTotal: input.cartDetails.total,
          siteName: siteConfig.name,
          siteContactEmail: siteConfig.contactInfo.find(c => c.title === 'Email')?.value || '',
        }),
        { plainText: true }
    );
      
    // TODO: Replace this with an actual email sending service
    console.log('--- SIMULATING SENDING ORDER EMAIL ---');
    console.log(`To: ${siteConfig.checkout.contact.email}`);
    console.log(`From: noreply@${siteConfig.name.toLowerCase().replace(/\s/g, '')}.com`);
    console.log(`Subject: New Order Received from ${input.customerDetails.name}`);
    console.log('--- TEXT BODY ---');
    console.log(emailText);
    console.log('--- HTML BODY ---');
    console.log(emailHtml.substring(0, 500) + '...'); // Log a snippet of the HTML
    console.log('--- END OF SIMULATION ---');

    // Here you would add your email sending logic, for example using Nodemailer:
    /*
    const transporter = nodemailer.createTransport({ ... });
    await transporter.sendMail({
      from: `"${siteConfig.name}" <noreply@yourdomain.com>`,
      to: siteConfig.checkout.contact.email,
      subject: `New Order from ${input.customerDetails.name}`,
      html: emailHtml,
      text: emailText,
    });
    */
  }
);
