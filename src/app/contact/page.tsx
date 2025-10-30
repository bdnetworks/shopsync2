
'use client';

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { getIcon } from "@/lib/icons.tsx";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const socialWhatsapp = siteConfig.socialLinks.find(link => link.name === 'WhatsApp');

  const isFormValid = name && email && subject && message;

  const contactBodyText = useMemo(() => {
    return `
Hi, I have a question.

*Name* : ${name}
*Email* : ${email}
*Subject* : ${subject}
-------------------
*Message* : 
${message}
-------------------
via. ${typeof window !== 'undefined' ? window.location.origin : ''}
    `.trim();
  }, [name, email, subject, message]);
  
  const gmailComposeLink = useMemo(() => {
    if (!isFormValid) return '#';
    const adminEmail = siteConfig.checkout.contact.email;
    const emailSubject = `Contact Form: ${subject}`;
    
    // For mobile, use mailto: to open the default email app
    if (isMobile) {
      return `mailto:${adminEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(contactBodyText)}`;
    }
    
    // For desktop, use the full Gmail compose URL
    const params = new URLSearchParams({
      to: adminEmail,
      su: emailSubject,
      body: contactBodyText,
      fs: '1',
      view: 'cm'
    });
    return `https://mail.google.com/mail/?${params.toString()}`;
  }, [isFormValid, contactBodyText, isMobile, subject]);

  const whatsappContactLink = useMemo(() => {
    if (!isFormValid) return '#';
    const whatsappNumber = siteConfig.checkout.contact.whatsappNumber;
    const encodedText = encodeURIComponent(contactBodyText);
    return `https://wa.me/${whatsappNumber}?text=${encodedText}`;
  }, [isFormValid, contactBodyText]);


  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Contact Us</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          We'd love to hear from you. Whether you have a question, feedback, or just want to say hello, feel free to reach out.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Send us a Message</CardTitle>
            <CardDescription>Fill out the form and choose your contact method.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={e => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="Your Name" required value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" name="email" placeholder="your@email.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="Question about an order" required value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="Your message..." rows={5} required value={message} onChange={e => setMessage(e.target.value)} />
              </div>
              
               <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button asChild size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white" disabled={!isFormValid}>
                      <Link href={whatsappContactLink} target="_blank">
                        <WhatsAppIcon />
                        via WhatsApp
                      </Link>
                  </Button>
                  <Button asChild size="lg" className="w-full bg-red-500 hover:bg-red-600 text-white" disabled={!isFormValid}>
                      <Link href={gmailComposeLink} target="_blank">
                        <Mail />
                        via Email
                      </Link>
                  </Button>
              </div>
              {!isFormValid && <p className="text-sm text-center text-destructive mt-4">Please fill out all fields to send a message.</p>}
            </form>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
            <h2 className="font-headline text-2xl font-semibold">Our Information</h2>
            {siteConfig.contactInfo.map(info => {
              const Icon = getIcon(info.icon);
              return (
                <div key={info.title} className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                        {Icon && <Icon className="h-6 w-6" />}
                    </div>
                    <div>
                        <h3 className="font-semibold">{info.title}</h3>
                        <p className="text-muted-foreground">{info.value}</p>
                    </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  );
}
