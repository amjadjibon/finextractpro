"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  AlertTriangle,
  TrendingDown,
  Brain,
  FileText,
  Zap,
  Target,
  BookOpen,
  Download,
  Play,
  Check,
  Star,
  ArrowRight,
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  PlayCircle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [roiData, setRoiData] = useState({
    documents: 500,
    hoursPerDoc: 0.5,
    hourlyRate: 50,
  })

  const calculateROI = () => {
    const monthlyHours = roiData.documents * roiData.hoursPerDoc
    const monthlyCost = monthlyHours * roiData.hourlyRate
    const softwareCost = 299
    const timeSaved = monthlyHours * 0.95 // 95% time savings
    const costSaved = monthlyCost * 0.95
    const netSavings = costSaved - softwareCost

    return {
      timeSaved: Math.round(timeSaved),
      costSaved: Math.round(costSaved),
      netSavings: Math.round(netSavings),
    }
  }

  const roi = calculateROI()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">FinExtractPro</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="#demo" className="text-sm text-gray-600 hover:text-blue-900 transition-colors font-medium">
              Demo
            </Link>
            <Link href="#features" className="text-sm text-gray-600 hover:text-blue-900 transition-colors font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-blue-900 transition-colors font-medium">
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-sm text-gray-600 hover:text-blue-900 transition-colors font-medium"
            >
              Testimonials
            </Link>
            <Link href="#roi" className="text-sm text-gray-600 hover:text-blue-900 transition-colors font-medium">
              ROI Calculator
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white bg-transparent transition-all duration-300"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              className="bg-blue-900 hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Start Free Trial
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 py-3 animate-in slide-in-from-top-2 duration-300">
            <div className="container mx-auto px-4 space-y-3">
              <Link
                href="#demo"
                className="block text-sm text-gray-600 hover:text-blue-900 transition-colors font-medium"
              >
                Demo
              </Link>
              <Link
                href="#features"
                className="block text-sm text-gray-600 hover:text-blue-900 transition-colors font-medium"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="block text-sm text-gray-600 hover:text-blue-900 transition-colors font-medium"
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="block text-sm text-gray-600 hover:text-blue-900 transition-colors font-medium"
              >
                Testimonials
              </Link>
              <Link
                href="#roi"
                className="block text-sm text-gray-600 hover:text-blue-900 transition-colors font-medium"
              >
                ROI Calculator
              </Link>
              <div className="flex flex-col space-y-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white bg-transparent"
                >
                  Sign In
                </Button>
                <Button size="sm" className="bg-blue-900 hover:bg-blue-800">
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-in slide-in-from-left-8 duration-1000">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-900 hover:bg-blue-100 px-3 py-1 text-xs font-semibold">
                  🚀 AI-Powered Financial Data Extraction
                </Badge>
                <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                  Stop Wasting Hours on{" "}
                  <span className="text-blue-900 relative">
                    Manual PDF
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-200 rounded-full"></div>
                  </span>{" "}
                  Data Entry
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
                  AI-powered extraction of financial tables from complex PDFs with{" "}
                  <span className="font-semibold text-blue-900">99% accuracy</span>. Process hundreds of documents in
                  minutes, not days.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="bg-blue-900 hover:bg-blue-800 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-6 py-3 bg-transparent transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Play className="mr-2 w-4 h-4" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Split-screen comparison */}
            <div className="relative animate-in slide-in-from-right-8 duration-1000 delay-300">
              <div className="bg-white rounded-2xl shadow-xl p-6 transform rotate-1 hover:rotate-0 transition-all duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Before: Messy PDF</div>
                    <div className="bg-red-50 border-2 border-red-100 rounded-lg p-4 h-32 flex flex-col items-center justify-center relative overflow-hidden">
                      <FileText className="w-12 h-12 text-red-400 mb-1" />
                      <div className="absolute inset-0 bg-red-100 opacity-20 transform -skew-x-12"></div>
                      <div className="text-xs text-red-600 font-medium">Unstructured Data</div>
                    </div>
                    <div className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
                      ⏱️ 15-20 hours weekly
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                      After: Clean Excel
                    </div>
                    <div className="bg-green-50 border-2 border-green-100 rounded-lg p-4 h-32 flex items-center justify-center">
                      <div className="grid grid-cols-4 gap-1 w-full">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-green-200 h-2 rounded animate-pulse"
                            style={{ animationDelay: `${i * 100}ms` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                      ⚡ 2-3 minutes
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                    <Zap className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-900">99% Accuracy Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-in fade-in-50 duration-1000">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">See FinExtractPro in Action</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Watch how our AI transforms complex financial PDFs into structured data in just minutes
            </p>
          </div>

          <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-1000 delay-300">
            {/* Video Demo Placeholder */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-2 relative overflow-hidden group cursor-pointer hover:shadow-3xl transition-all duration-500">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-16 h-80 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Play Button */}
                  <div className="relative z-10 flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                      <PlayCircle className="w-12 h-12 text-white group-hover:text-blue-300 transition-colors duration-300" />
                    </div>
                    <div className="text-center">
                      <div className="text-white text-xl font-semibold mb-2">Watch 2-Minute Demo</div>
                      <div className="text-blue-200 text-sm">See how FinExtractPro processes financial documents</div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="absolute top-4 left-10 w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="absolute top-4 left-16 w-3 h-3 bg-green-500 rounded-full"></div>

                  {/* Mock Browser Frame */}
                  <div className="absolute top-12 left-4 right-4 h-1 bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Video Stats */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900 mb-1">2:15</div>
                  <div className="text-sm text-gray-600">Demo Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900 mb-1">99%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900 mb-1">3 min</div>
                  <div className="text-sm text-gray-600">Processing Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Below Video */}
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-900 hover:bg-blue-800 px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-8 py-3 bg-transparent transition-all duration-300"
              >
                Schedule a Demo Call
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-in fade-in-50 duration-1000">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">The Manual Data Entry Nightmare</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Finance teams waste countless hours on repetitive tasks that could be automated, leading to burnout and
              costly errors
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "15-20 Hours Weekly",
                description:
                  "Your team spends entire days manually copying data from PDFs into spreadsheets, time that could be spent on strategic analysis",
                color: "red",
              },
              {
                icon: AlertTriangle,
                title: "3-5% Error Rates",
                description:
                  "Human errors in data entry lead to costly mistakes, compliance issues, and damaged client relationships",
                color: "orange",
              },
              {
                icon: TrendingDown,
                title: "Can't Scale",
                description:
                  "Manual processes become bottlenecks as your business grows and document volume increases exponentially",
                color: "gray",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1 animate-in fade-in-50 duration-1000"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader className="pb-3">
                  <div
                    className={`w-16 h-16 bg-${item.color}-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md`}
                  >
                    <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                  </div>
                  <CardTitle className="text-xl text-gray-900 mb-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-in fade-in-50 duration-1000">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Unlock the Power of AI</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our advanced AI understands financial documents and extracts data with unprecedented accuracy and speed
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Smart Table Detection",
                description:
                  "AI automatically identifies and extracts tables from complex financial documents, regardless of format or layout",
              },
              {
                icon: FileText,
                title: "Financial Document Intelligence",
                description:
                  "Specialized AI trained on financial statements, invoices, reports, and regulatory documents",
              },
              {
                icon: Zap,
                title: "Batch Processing",
                description: "Process hundreds of documents simultaneously with our scalable cloud infrastructure",
              },
              {
                icon: Target,
                title: "99% Accuracy",
                description:
                  "Industry-leading accuracy rates with built-in validation, error checking, and quality assurance",
              },
              {
                icon: BookOpen,
                title: "Pattern Learning",
                description:
                  "AI learns from your specific document formats and continuously improves extraction accuracy",
              },
              {
                icon: Download,
                title: "Instant Excel Export",
                description:
                  "Export clean, formatted data directly to Excel, CSV, or integrate with your existing systems via API",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1 group animate-in fade-in-50 duration-1000"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-900 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-blue-900 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-lg text-gray-900 mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section
        id="roi"
        className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12 animate-in fade-in-50 duration-1000">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Calculate Your ROI</h2>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
              See how much time and money you could save with FinExtractPro
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl animate-in slide-in-from-bottom-8 duration-1000">
              <CardContent className="p-6 lg:p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold mb-4">Your Current Situation</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Documents processed per month</label>
                        <Input
                          type="number"
                          value={roiData.documents}
                          onChange={(e) => setRoiData({ ...roiData, documents: Number.parseInt(e.target.value) || 0 })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Hours per document (manual)</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={roiData.hoursPerDoc}
                          onChange={(e) =>
                            setRoiData({ ...roiData, hoursPerDoc: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Average hourly rate ($)</label>
                        <Input
                          type="number"
                          value={roiData.hourlyRate}
                          onChange={(e) => setRoiData({ ...roiData, hourlyRate: Number.parseInt(e.target.value) || 0 })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 py-2"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold mb-4">Your Monthly Savings</h3>
                    <div className="bg-white/10 rounded-xl p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-300 mb-1">{roi.timeSaved}</div>
                          <div className="text-xs text-blue-100">Hours Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-300 mb-1">
                            ${roi.costSaved.toLocaleString()}
                          </div>
                          <div className="text-xs text-blue-100">Cost Saved</div>
                        </div>
                      </div>
                      <Separator className="bg-white/20" />
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Monthly cost savings:</span>
                          <span className="font-semibold">${roi.costSaved.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Software cost:</span>
                          <span className="font-semibold">-$299</span>
                        </div>
                        <Separator className="bg-white/20" />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Net monthly savings:</span>
                          <span className="text-green-300">${roi.netSavings.toLocaleString()}</span>
                        </div>
                        <div className="text-center text-xs text-blue-100 mt-3">
                          Annual savings:{" "}
                          <span className="font-bold text-green-300">${(roi.netSavings * 12).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="lg" className="w-full bg-white text-blue-900 hover:bg-gray-100 py-3 shadow-lg">
                      Start Saving Today
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-in fade-in-50 duration-1000">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Trusted by Finance Teams</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See what our customers say about transforming their data extraction workflows
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Chen",
                role: "CFO",
                company: "TechCorp",
                image: "/placeholder.svg?height=56&width=56",
                quote:
                  "FinExtractPro reduced our monthly reporting time from 3 days to 3 hours. The accuracy is incredible and our team can focus on analysis instead of data entry. ROI was immediate.",
                rating: 5,
              },
              {
                name: "Michael Rodriguez",
                role: "Finance Director",
                company: "GlobalCorp",
                image: "/placeholder.svg?height=56&width=56",
                quote:
                  "We process over 1,000 invoices monthly. This tool has eliminated errors and saved us $50,000 annually in labor costs. Best investment we've made for our finance department.",
                rating: 5,
              },
              {
                name: "Emily Johnson",
                role: "Controller",
                company: "StartupXYZ",
                image: "/placeholder.svg?height=56&width=56",
                quote:
                  "The AI learns our document formats perfectly. Setup was easy and the support team is fantastic. Highly recommend for any finance team looking to scale efficiently.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1 animate-in fade-in-50 duration-1000"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-gray-600 mb-6 leading-relaxed">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={56}
                      height={56}
                      className="rounded-full mr-3 shadow-md"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-in fade-in-50 duration-1000">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose the plan that fits your document processing needs. All plans include our core AI features.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: 99,
                description: "Perfect for small teams",
                features: [
                  "Up to 500 documents/month",
                  "Basic AI extraction",
                  "Excel/CSV export",
                  "Email support",
                  "99% accuracy guarantee",
                  "14-day free trial",
                ],
                popular: false,
                cta: "Start Free Trial",
              },
              {
                name: "Professional",
                price: 299,
                description: "For growing businesses",
                features: [
                  "Up to 2,000 documents/month",
                  "Advanced AI with learning",
                  "API access",
                  "Priority support",
                  "Custom integrations",
                  "Advanced analytics",
                  "Team collaboration",
                  "SLA guarantee",
                ],
                popular: true,
                cta: "Start Free Trial",
              },
              {
                name: "Enterprise",
                price: 899,
                description: "For large organizations",
                features: [
                  "Unlimited documents",
                  "Custom AI training",
                  "Dedicated infrastructure",
                  "24/7 phone support",
                  "Custom integrations",
                  "Advanced security",
                  "Dedicated account manager",
                  "Custom SLA",
                ],
                popular: false,
                cta: "Contact Sales",
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1 relative animate-in fade-in-50 duration-1000 ${
                  plan.popular ? "border-blue-900 shadow-md scale-105" : ""
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-900 text-white px-3 py-1 text-xs font-semibold shadow-md">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl text-gray-900 mb-1">{plan.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 mb-4">{plan.description}</CardDescription>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                  <Button
                    className={`w-full mt-6 py-3 transition-all duration-300 ${
                      plan.popular
                        ? "bg-blue-900 hover:bg-blue-800 shadow-md hover:shadow-lg"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {plan.cta}
                    {plan.cta === "Contact Sales" ? (
                      <Mail className="ml-2 w-4 h-4" />
                    ) : (
                      <ArrowRight className="ml-2 w-4 h-4" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-gray-600 mb-3">
              All plans include 14-day free trial • No setup fees • Cancel anytime
            </p>
            <div className="flex justify-center items-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center">
                <Check className="w-3 h-3 text-green-500 mr-1" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center">
                <Check className="w-3 h-3 text-green-500 mr-1" />
                <span>GDPR Ready</span>
              </div>
              <div className="flex items-center">
                <Check className="w-3 h-3 text-green-500 mr-1" />
                <span>99.9% Uptime SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">FinExtractPro</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                AI-powered financial document processing that saves time, eliminates errors, and scales with your
                business.
              </p>
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <Building className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <Mail className="w-3 h-3 mr-2" />
                  support@finextractpro.com
                </li>
                <li className="flex items-center">
                  <Phone className="w-3 h-3 mr-2" />
                  1-800-EXTRACT
                </li>
                <li className="flex items-center">
                  <MapPin className="w-3 h-3 mr-2" />
                  San Francisco, CA
                </li>
              </ul>
              <div className="mt-4">
                <h4 className="font-semibold text-xs mb-2">Integrations</h4>
                <div className="flex space-x-2">
                  <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">XL</span>
                  </div>
                  <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">SF</span>
                  </div>
                  <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">QB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Separator className="bg-gray-800 mb-6" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-gray-400 mb-3 md:mb-0">
              © {new Date().getFullYear()} FinExtractPro. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-xs text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-xs text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
