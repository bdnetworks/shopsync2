
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { getIcon } from "@/lib/icons";
import { useToast } from '@/hooks/use-toast';

const WhatsAppIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        d="M16.75 13.96c.25.13.43.2.5.28.08.09.14.19.19.3.05.11.06.23.02.35-.04.12-.13.24-.26.36-.13.12-.28.23-.46.33-.18.1-.38.16-.6.18-.21.02-.43.0-.65-.05-.22-.05-.44-.12-.66-.23-.22-.1-.43-.23-.64-.39-.21-.16-.41-.34-.6-.54s-.37-.42-.53-.65c-.16-.23-.3-.48-.43-.74-.12-.26-.23-.53-.32-.81-.09-.28-.15-.56-.19-.85-.04-.29-.04-.57-.01-.85.03-.28.1-.55.19-.81.1-.26.22-.5.37-.71.15-.21.32-.4.51-.56.2-.16.41-.3.65-.41.24-.11.49-.19.76-.23.27-.04.53-.05.79-.02.26.03.5.1.73.2.23.1.43.23.6.39.17.16.3.35.4.56.1.21.15.43.15.66.0.23-.05.45-.14.66-.09.21-.22.4-.38.56-.16.16-.35.3-.56.41-.21.11-.44.19-.68.24-.1.02-.19.03-.29.03-.1 0-.2-.02-.29-.05-.1-.03-.18-.06-.26-.11-.08-.05-.15-.1-.21-.16-.06-.06-.11-.13-.15-.21-.04-.08-.06-.16-.07-.25-.01-.09.01-.18.04-.26.04-.08.09-.16.15-.22.06-.06.13-.11.21-.15.08-.04.16-.06.25-.07.09-.01.18.01.26.04.08.03.16.08.22.14.03.03.05.05.06.07.01.02.03.04.04.06.01.02.02.04.03.06.01.02.01.04.01.06v.01c0 .02.01.03.01.03zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.73 0 3.36-.44 4.78-1.22l2.72 1.22-1.22-2.72C19.56 18.36 20 16.73 20 15c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      ></path>
    </svg>
);


export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;
    const whatsappMessage = `Hello, I have a query.\n\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject}\n\n*Message:*\n${message}`;
    const whatsappUrl = `https://wa.me/${siteConfig.checkout.contact.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

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
            <CardDescription>Fill out the form and we'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="Question about an order" value={formData.subject} onChange={handleChange} required />
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="Your message..." rows={5} value={formData.message} onChange={handleChange} required />
              </div>
              <Button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-700">
                <WhatsAppIcon />
                Send via WhatsApp
              </Button>
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
