import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
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
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Question about an order" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message..." rows={5} />
              </div>
              <Button type="submit" className="w-full">Send Message</Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
            <h2 className="font-headline text-2xl font-semibold">Our Information</h2>
            <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Mail className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-muted-foreground">hello@shopsync.com</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Phone className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-muted-foreground">(123) 456-7890</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <MapPin className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-semibold">Office</h3>
                    <p className="text-muted-foreground">123 Commerce St, Online City, 10101</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
