
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { getIcon } from "@/lib/icons";

export default function ContactPage() {
  const formId = "1FAIpQLSeMyWblnqUThfwEbXI6-QO3thxAMZjZmVJux2_S0YG5Sr2eRQ";
  const formActionUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
  
  const entryIds = {
    name: "entry.224376188",
    email: "entry.1389401831",
    subject: "entry.1715219048",
    message: "entry.1263451416"
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
            <form
              action={formActionUrl}
              method="POST"
              target="_blank" 
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name={entryIds.name} placeholder="Your Name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" name={entryIds.email} placeholder="your@email.com" required />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name={entryIds.subject} placeholder="Question about an order" required />
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name={entryIds.message} placeholder="Your message..." rows={5} required />
              </div>
              <Button type="submit" className="w-full mt-4">
                Send Message
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
