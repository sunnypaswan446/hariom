
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoanStore } from '@/lib/store';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Pencil, UserPlus, X, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const teamMemberSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
});
type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const { officers, addOfficer, updateOfficer, removeOfficer } = useLoanStore();
  const [editingOfficer, setEditingOfficer] = useState<string | null>(null);

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: { name: '' },
  });

  const editForm = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
  });

  const handleAddOfficer = (data: TeamMemberFormValues) => {
    if (officers.includes(data.name)) {
      form.setError('name', { type: 'manual', message: 'This team member already exists.' });
      return;
    }
    addOfficer(data.name);
    toast({ title: 'Team Member Added', description: `${data.name} has been added.` });
    form.reset();
  };

  const handleUpdateOfficer = (originalName: string, data: TeamMemberFormValues) => {
    if (data.name !== originalName && officers.includes(data.name)) {
        editForm.setError('name', { type: 'manual', message: 'This team member already exists.' });
        return;
    }
    updateOfficer(originalName, data.name);
    toast({ title: 'Team Member Updated', description: `Updated to ${data.name}.` });
    setEditingOfficer(null);
  };
  
  const handleRemoveOfficer = (name: string) => {
    removeOfficer(name);
    toast({ title: 'Team Member Removed', description: `${name} has been removed.`, variant: 'destructive' });
  };
  
  const startEditing = (name: string) => {
    setEditingOfficer(name);
    editForm.setValue('name', name);
  };

  const cancelEditing = () => {
    setEditingOfficer(null);
    editForm.reset();
  };

  return (
    <>
      <PageHeader title="Settings" description="Manage your application settings." />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Add, edit, or remove team members from your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                {officers.map((officer) => (
                  <div key={officer} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    {editingOfficer === officer ? (
                       <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit((data) => handleUpdateOfficer(officer, data))} className="flex items-center gap-2 flex-1">
                           <FormField
                              control={editForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl><Input {...field} autoFocus /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                           />
                          <Button type="submit" size="icon" variant="ghost"><Save className="h-4 w-4" /></Button>
                          <Button type="button" size="icon" variant="ghost" onClick={cancelEditing}><X className="h-4 w-4" /></Button>
                        </form>
                      </Form>
                    ) : (
                      <>
                        <p className="font-medium">{officer}</p>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEditing(officer)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently remove <strong>{officer}</strong> from the team members list.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveOfficer(officer)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddOfficer)} className="flex items-start gap-2 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="sr-only">New Team Member</FormLabel>
                        <FormControl>
                           <Input placeholder="Enter new team member name..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" variant="outline">
                    <UserPlus className="mr-2" />
                    Add Member
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
