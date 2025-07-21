"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Users,
  Building,
  FileText,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        console.error('Error sending message:', result.error)
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">FinExtractPro</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link href="/auth/signin">
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent transition-all duration-300"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Start Free Trial
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-white to-secondary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12 animate-in fade-in-50 duration-1000">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 px-3 py-1 text-xs font-semibold mb-4">
              💬 Get in Touch
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
              Contact Our Team
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Have questions about FinExtractPro? Want to see a demo? Our team is here to help you transform your financial document processing.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-0 animate-in slide-in-from-left-8 duration-1000">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 mb-2">Send us a message</CardTitle>
                  <CardDescription className="text-gray-600">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                      <p className="text-gray-600 mb-6">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                      <Button
                        onClick={() => {
                          setIsSubmitted(false)
                          setFormData({
                            name: "",
                            email: "",
                            company: "",
                            subject: "",
                            message: "",
                          })
                        }}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="border-gray-300 focus:border-primary focus:ring-primary"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="border-gray-300 focus:border-primary focus:ring-primary"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="border-gray-300 focus:border-primary focus:ring-primary"
                          placeholder="Enter your company name"
                        />
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="border-gray-300 focus:border-primary focus:ring-primary"
                          placeholder="What can we help you with?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          Message *
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          rows={6}
                          value={formData.message}
                          onChange={handleInputChange}
                          className="border-gray-300 focus:border-primary focus:ring-primary resize-none"
                          placeholder="Tell us more about your needs..."
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-1000">
              {/* Direct Contact */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center">
                    <MessageSquare className="mr-2 w-5 h-5 text-primary" />
                    Get in Touch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-primary mr-3 shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Email</div>
                      <a href="mailto:support@finextractpro.com" className="text-sm text-gray-600 hover:text-primary transition-colors">
                        support@finextractpro.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-primary mr-3 shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Phone</div>
                      <a href="tel:1-800-EXTRACT" className="text-sm text-gray-600 hover:text-primary transition-colors">
                        1-800-EXTRACT
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Office</div>
                      <div className="text-sm text-gray-600">San Francisco, CA</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-primary mr-3 shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Business Hours</div>
                      <div className="text-sm text-gray-600">Mon-Fri, 9AM-6PM PST</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sales Team */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center">
                    <Users className="mr-2 w-5 h-5 text-primary" />
                    Sales & Demos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Ready to see FinExtractPro in action? Schedule a personalized demo with our sales team.
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
                    asChild
                  >
                    <a href="mailto:sales@finextractpro.com?subject=Demo Request">
                      Schedule Demo
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center">
                    <Building className="mr-2 w-5 h-5 text-primary" />
                    Enterprise Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Need custom integrations or enterprise-level support? Our team can help.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    asChild
                  >
                    <a href="mailto:enterprise@finextractpro.com?subject=Enterprise Inquiry">
                      Contact Enterprise
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Quick answers to common questions about FinExtractPro
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                question: "How accurate is the AI extraction?",
                answer: "Our AI achieves 99% accuracy on financial documents. We use specialized models trained on financial data formats and include built-in validation checks."
              },
              {
                question: "What file formats do you support?",
                answer: "We support PDF, Word documents, Excel files, and most image formats (JPG, PNG, TIFF). Our AI works best with PDFs containing financial tables."
              },
              {
                question: "How long does processing take?",
                answer: "Most documents are processed within 2-3 minutes. Batch processing of multiple documents can be completed simultaneously for faster turnaround."
              },
              {
                question: "Do you offer API access?",
                answer: "Yes! Professional and Enterprise plans include full API access for seamless integration with your existing workflows and systems."
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. We're SOC 2 compliant, GDPR ready, and use enterprise-grade encryption. Your documents are processed securely and never stored permanently."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Yes, you can cancel your subscription at any time. We offer a 14-day free trial with no setup fees or long-term commitments required."
              }
            ].map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              asChild
            >
              <a href="mailto:support@finextractpro.com?subject=Question">
                Ask a Question
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">FinExtractPro</span>
            </div>
            <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
              AI-powered financial document processing that saves time, eliminates errors, and scales with your business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 text-xs text-gray-400">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
            </div>
            <p className="text-xs text-gray-400 mt-6">
              © {new Date().getFullYear()} FinExtractPro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}