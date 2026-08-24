import { eq, desc } from "drizzle-orm";
import { Users, Search } from "lucide-react";
import { getCurrentDbUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles, audienceContacts } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default async function AudiencePage() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const contacts = profile
    ? await db
        .select()
        .from(audienceContacts)
        .where(eq(audienceContacts.profileId, profile.id))
        .orderBy(desc(audienceContacts.createdAt))
        .limit(100)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audience</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage contacts captured from your bio page.
        </p>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="size-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No contacts yet
            </p>
            <p className="mt-1 max-w-sm text-center text-sm text-slate-500">
              When visitors submit their info through your email capture or form
              blocks, they&apos;ll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search contacts..."
                className="pl-9"
                readOnly
              />
            </div>
            <Badge variant="secondary">{contacts.length} contacts</Badge>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium text-slate-900">
                        {[contact.firstName, contact.lastName]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {contact.email ?? "—"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {contact.phone ?? "—"}
                      </TableCell>
                      <TableCell>
                        {contact.source ? (
                          <Badge variant="secondary" className="text-xs">
                            {contact.source}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
