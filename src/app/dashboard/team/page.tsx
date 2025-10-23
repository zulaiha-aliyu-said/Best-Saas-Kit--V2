"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, UserPlus, Mail, Shield, Activity, Copy, Check } from "lucide-react"
import { UpgradePrompt } from "@/components/upgrade/UpgradePrompt"

export default function TeamPage() {
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [invitationLink, setInvitationLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [tierInfo, setTierInfo] = useState<{ currentTier: number; requiredTier: number } | null>(null)

  const handleInvite = async () => {
    if (!inviteEmail) {
      alert('Please enter an email address')
      return
    }

    setInviting(true)
    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail })
      })

      const data = await response.json()

      // Handle tier restriction
      if (response.status === 403 && data.code === 'TIER_RESTRICTED') {
        setTierInfo({ currentTier: data.currentTier, requiredTier: data.requiredTier })
        setShowUpgrade(true)
        setInviting(false)
        setShowInviteDialog(false)
        return
      }

      // Handle limit exceeded
      if (response.status === 429 && data.code === 'LIMIT_EXCEEDED') {
        alert(data.message)
        setInviting(false)
        return
      }

      if (data.success) {
        setInvitationLink(data.invitationLink)
        // Don't close dialog, show link instead
      }
    } catch (error) {
      console.error('Error inviting member:', error)
      alert('Failed to send invitation. Please try again.')
    } finally {
      setInviting(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  if (showUpgrade && tierInfo) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Team Collaboration</h1>
          </div>
          <p className="text-muted-foreground">
            Invite team members and collaborate together
          </p>
        </div>

        <UpgradePrompt
          featureName="Team Collaboration"
          currentTier={tierInfo.currentTier}
          requiredTier={tierInfo.requiredTier}
          variant="inline"
          benefits={[
            "Invite up to 3 team members",
            "Role-based permissions",
            "Shared templates & styles",
            "Team activity dashboard",
            "2,000 credits/month (Tier 4)"
          ]}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold tracking-tight">Team Collaboration</h1>
              <Badge className="bg-amber-600">Tier 4</Badge>
            </div>
            <p className="text-muted-foreground">
              Invite up to 3 team members and work together
            </p>
          </div>

          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to collaborate on your account
                </DialogDescription>
              </DialogHeader>

              {!invitationLink ? (
                <div className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="teammate@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <Mail className="w-5 h-5" />
                    <span className="font-semibold">Invitation Created!</span>
                  </div>
                  <div>
                    <Label>Invitation Link</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={invitationLink} readOnly />
                      <Button onClick={handleCopyLink} variant="outline">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Link expires in 7 days
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInviteDialog(false)
                    setInviteEmail('')
                    setInvitationLink('')
                  }}
                >
                  Close
                </Button>
                {!invitationLink && (
                  <Button onClick={handleInvite} disabled={inviting}>
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0/3</div>
            <p className="text-sm text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Team Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Actions this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Full</div>
            <p className="text-sm text-muted-foreground">Access level</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Team Members Yet</h3>
          <p className="text-muted-foreground mb-4">
            Invite your first team member to start collaborating
          </p>
          <Button onClick={() => setShowInviteDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Team Member
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

