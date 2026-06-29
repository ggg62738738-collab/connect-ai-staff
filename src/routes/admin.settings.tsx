import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/admin/page-header";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Manage workspace preferences, branding, and platform fees." />
      <div className="p-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>How Talentora appears to your network.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Workspace name</Label>
              <Input defaultValue="Talentora" />
            </div>
            <div className="space-y-1.5">
              <Label>Support email</Label>
              <Input type="email" defaultValue="support@talentora.io" />
            </div>
            <div className="space-y-1.5">
              <Label>Default currency</Label>
              <Input defaultValue="USD" />
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform fees</CardTitle>
            <CardDescription>Margin retained on each placement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Company service fee</Label>
              <Input defaultValue="10%" />
            </div>
            <div className="space-y-1.5">
              <Label>Freelancer payout fee</Label>
              <Input defaultValue="5%" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-invoicing</p>
                <p className="text-xs text-muted-foreground">Generate weekly invoices automatically.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Escrow on contract start</p>
                <p className="text-xs text-muted-foreground">Hold first invoice in escrow until milestone approval.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>How your admin team gets pinged.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">New applications</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Failed payments</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">New companies</span>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}