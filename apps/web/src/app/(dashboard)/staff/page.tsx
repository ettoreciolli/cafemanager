import { db } from "@cafemanager/db";

import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteStaffMember } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { money } from "@/lib/format";

import { StaffDialog } from "./staff-form";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const user = await requireUser();
  const currency = user.currency;

  const staff = await db.staff.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <PageHeader
        title="Staff"
        description="Your team, roles and hourly rates"
        action={<StaffDialog />}
      />

      {staff.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No staff yet. Add your first team member.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>{staff.length} member{staff.length === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Hourly rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm text-muted-foreground">
                        {m.email && <span>{m.email}</span>}
                        {m.phone && <span className="text-xs">{m.phone}</span>}
                        {!m.email && !m.phone && "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{m.role}</Badge>
                    </TableCell>
                    <TableCell>{m.hourlyRate ? money(m.hourlyRate, currency) + "/hr" : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={m.active ? "default" : "ghost"}>
                        {m.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <StaffDialog
                          member={{
                            id: m.id,
                            name: m.name,
                            email: m.email,
                            phone: m.phone,
                            role: m.role,
                            hourlyRate: m.hourlyRate,
                            active: m.active,
                          }}
                        />
                        <DeleteButton
                          action={deleteStaffMember}
                          id={m.id}
                          label={`Remove ${m.name}`}
                          confirm={`Remove "${m.name}" from the staff list?`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}