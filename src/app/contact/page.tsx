
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { getIcon } from "@/lib/icons.tsx";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  
  const isFormValid = name && email && subject && message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
        toast({
            title: "Incomplete Form",
            description: "Please fill out all the fields.",
            variant: "destructive"
        });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || 'Failed to send message.');
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you shortly.",
      });

      // Clear form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');

    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "We couldn't send your message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <CardDescription>Fill out the form and we'll get back to you.</CardDescription>
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
                              Sending...
                          </>
                      ) : (
                          'Send Message'
                      )}
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
