
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Row,
    Column,
  } from '@react-email/components';
import * as React from 'react';
import type { CartItem } from '@/lib/types';
import { siteConfig } from '@/config/site';

  
interface OrderReceiptEmailProps {
    customerName: string;
    shippingAddress: string;
    orderItems: CartItem[];
    orderTotal: number;
    siteName: string;
    siteContactEmail: string;
}

const main = {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    backgroundColor: '#f6f9fc',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
    maxWidth: '100%',
};

const heading = {
    fontSize: '32px',
    lineHeight: '1.3',
    fontWeight: '700',
    color: '#484848',
};

const paragraph = {
    fontSize: '18px',
    lineHeight: '1.4',
    color: '#484848',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
};
  
export const OrderReceiptEmail = ({
    customerName,
    shippingAddress,
    orderItems,
    orderTotal,
    siteName,
    siteContactEmail
}: OrderReceiptEmailProps) => {
    const previewText = `New order received from ${customerName}`;

    return (
        <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={heading}>New Order from {customerName}</Heading>
                <Text style={paragraph}>You've received a new order request. Please review the details below and contact the customer to confirm.</Text>
                
                <Hr style={hr} />

                <Heading as="h2" style={{ ...heading, fontSize: '24px' }}>Customer Details</Heading>
                <Text style={paragraph}>
                    <strong>Name:</strong> {customerName}<br/>
                    <strong>Shipping Address:</strong> {shippingAddress}
                </Text>

                <Hr style={hr} />
                
                <Heading as="h2" style={{ ...heading, fontSize: '24px' }}>Order Summary</Heading>
                
                {orderItems.map((item) => (
                    <Section key={item.id}>
                        <Row style={{ marginBottom: '10px' }}>
                            <Column style={{ width: '64px' }}>
                                <Img src={item.image.src} alt={item.image.alt} width="64" height="64" style={{ borderRadius: '4px', objectFit: 'cover' }} />
                            </Column>
                            <Column>
                                <Text style={{...paragraph, margin: '0 0 5px 10px', fontSize: '16px', fontWeight: 'bold'}}>{item.name}</Text>
                                <Text style={{...paragraph, margin: '0 0 5px 10px', fontSize: '14px'}}>Quantity: {item.quantity}</Text>
                            </Column>
                            <Column style={{ textAlign: 'right' }}>
                                <Text style={{...paragraph, fontSize: '16px', fontWeight: 'bold'}}>{siteConfig.currency}{(item.price * item.quantity).toFixed(2)}</Text>
                            </Column>
                        </Row>
                    </Section>
                ))}

                <Hr style={hr} />

                <Section>
                    <Row>
                        <Column>
                            <Text style={{...paragraph, fontSize: '18px', fontWeight: 'bold'}}>Total</Text>
                        </Column>
                        <Column style={{ textAlign: 'right' }}>
                            <Text style={{...paragraph, fontSize: '18px', fontWeight: 'bold'}}>{siteConfig.currency}{orderTotal.toFixed(2)}</Text>
                        </Column>
                    </Row>
                </Section>
                
                <Hr style={hr} />

                <Text style={footer}>
                    {siteName} | This is an automated notification. For any questions, please contact the customer directly or reply to this email to reach our support team at {siteContactEmail}.
                </Text>

            </Container>
        </Body>
        </Html>
    );
};

export default OrderReceiptEmail;
