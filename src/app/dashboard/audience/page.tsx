import { eq, desc, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Users, Mail, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { profiles, audienceContacts } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportAudienceButton } from "./export-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audience",
};

export default async function AudiencePage() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile) redirect("/onboarding");

  const canExport = await canUseFeature(user.id, "csvExport");

  const contacts = await db
    .select()
    .from(audienceContacts)
    .where(eq(audienceContacts.profileId, profile.id))
    .orderBy(desc(audienceContacts.createdAt))
    .limit(100);

  const [countRow] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(audienceContacts)
    .where(eq(audienceContacts.profileId, profile.id));

  const totalContacts = Number(countRow?.total ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Audience</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalContacts} contact{totalContacts !== 1 ? "s" : ""} captured.
          </p>
        </div>
        <ExportAudienceButton profileId={profile.id} canExport={canExport} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {totalContacts.toLocaleString()}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50">
                <Users className="size-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emails</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {contacts.filter((c) => c.email).length}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50">
                <Mail className="size-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SMS</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {contacts.filter((c) => c.phone).length}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50">
                <Phone className="size-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No contacts yet. Add email or SMS capture blocks to start collecting
              leads.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">
                      Contact
                    </th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">
                      Source
                    </th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td className="py-3">
                        <div>
                          {contact.firstName && (
                            <p className="font-medium text-foreground">
                              {contact.firstName} {contact.lastName ?? ""}
                            </p>
                          )}
                          <p className="text-muted-foreground">
                            {contact.email ?? contact.phone ?? "—"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant="secondary" className="capitalize">
                          {contact.source?.replace("_", " ") ?? "unknown"}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {contact.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
