
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSiteConfig, type MergedSiteConfig } from "@/config/site";
import { getIcon } from "@/lib/icons.tsx";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [siteConfig, setSiteConfig] = useState<MergedSiteConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await getSiteConfig();
      setSiteConfig(config);
    }
    fetchConfig();
  }, []);
  
  const isFormValid = name && email && subject && message;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !siteConfig || !siteConfig.phone) {
        toast({
            title: "Incomplete Form",
            description: "Please fill out all the fields and ensure site configuration is loaded.",
            variant: "destructive"
        });
        return;
    }
    
    setIsSubmitting(true);

    const whatsappNumber = siteConfig.phone.replace(/\D/g, '');
    const prefilledMessage = `Hello, I'm contacting you from your website.\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(prefilledMessage)}`;

    window.open(whatsappUrl, '_blank');
    
    // Clear form after attempting to open WhatsApp
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');

    setIsSubmitting(false);

    toast({
        title: "Redirecting to WhatsApp",
        description: "Your message is ready to be sent via WhatsApp.",
    });
  };

  if (!siteConfig) {
      return <div>Loading...</div> // Or a skeleton loader
  }
  
  const whatsAppUrl = `https://wa.me/${siteConfig.phone.replace(/\D/g, '')}?text=Hello%2C%20I%20have%20a%20question.`;
  const WhatsAppIcon = getIcon('WhatsApp');

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
            <CardDescription>Fill out the form to start a conversation on WhatsApp.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
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
              
              <div className="mt-4">
                  <Button type="submit" size="lg" className="w-full" disabled={!isFormValid || isSubmitting}>
                      {isSubmitting ? (
                          <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Redirecting...
                          </>
                      ) : (
                          <>
                            <WhatsAppIcon className="h-5 w-5 mr-2"/> Send on WhatsApp
                          </>
                      )}
                  </Button>
              </div>
              {!isFormValid && <p className="text-sm text-center text-destructive mt-4">Please fill out all fields to send a message.</p>}
            </form>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
            <h2 className="font-headline text-2xl font-semibold">Our Information</h2>
            <div className="space-y-4">
              {siteConfig.contactInfo.map(info => {
                const Icon = getIcon(info.icon);
                if (!info.value) return null;
                return (
                  <div key={info.title} className="flex items-start gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-lg">
                          {Icon && <Icon className="h-5 w-5" />}
                      </div>
                      <div>
                          <h3 className="font-semibold text-lg">{info.title}</h3>
                          <p className="text-muted-foreground">{info.value}</p>
                      </div>
                  </div>
                )
              })}
            </div>
             <Card className="bg-muted/50">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-headline text-lg font-semibold">Have an Urgent Query?</h3>
                    <p className="text-muted-foreground text-sm">Get an instant response from our team.</p>
                </div>
                <Button asChild>
                    <Link href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                       {WhatsAppIcon && <WhatsAppIcon className="h-5 w-5 mr-2"/>} Chat on WhatsApp
                    </Link>
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
