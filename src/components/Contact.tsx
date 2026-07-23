import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { contact } from '@/config/brand'

export function Contact() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({ title: contact.form.errorTitle, variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    // Simulate submission — connect to a backend to actually send
    setTimeout(() => {
      toast({ title: contact.form.successTitle, description: contact.form.successDescription })
      setFormData({ name: '', email: '', message: '' })
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <section id="contact" className="relative py-32 bg-card/30">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              {contact.eyebrow}
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8">
            <span className="block mb-2">{contact.title}</span>
          </h2>
          
          <p className="text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {contact.subtitle}
          </p>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-background clean-border rounded-3xl overflow-hidden elevated-shadow">
            <div className="bg-card/50 px-8 py-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
              <h3 className="text-xl font-black text-foreground mb-1">
                {contact.cardTitle}
              </h3>
              <p className="text-muted-foreground">
                {contact.cardDescription}
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent-emerald rounded-full" />
              <span className="text-sm text-muted-foreground font-medium">{contact.availability}</span>
            </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">{contact.form.nameLabel}</label>
                  <input
                    id="name"
                    type="text"
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                    placeholder={contact.form.namePlaceholder}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">{contact.form.emailLabel}</label>
                  <input
                    id="email"
                    type="email"
                    maxLength={255}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                    placeholder={contact.form.emailPlaceholder}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">{contact.form.messageLabel}</label>
                <textarea
                  id="message"
                  rows={5}
                  maxLength={1000}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all resize-none"
                  placeholder={contact.form.messagePlaceholder}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-foreground text-background font-black text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? contact.form.submittingText : contact.form.submitButton}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {contact.infoCards.map((card) => (
              <div key={card.title} className="bg-background clean-border rounded-2xl p-6 subtle-shadow">
                <div className={`w-12 h-12 bg-${card.color}/10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <div className={`w-6 h-6 bg-${card.color} rounded-full`} />
                </div>
                <h4 className="font-black text-foreground mb-2">{card.title}</h4>
                <p className="text-muted-foreground text-sm">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}