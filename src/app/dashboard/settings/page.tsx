
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
import { Trash2, Pencil, UserPlus, X, Save, Landmark } from 'lucide-react';
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

const nameSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
});
type NameFormValues = z.infer<typeof nameSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const { officers, addOfficer, updateOfficer, removeOfficer, banks, addBank, updateBank, removeBank } = useLoanStore();
  const [editingOfficer, setEditingOfficer] = useState<string | null>(null);
  const [editingBank, setEditingBank] = useState<string | null>(null);

  const officerForm = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: '' },
  });

  const editOfficerForm = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
  });

  const bankForm = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: '' },
  });

  const editBankForm = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
  });

  const handleAddOfficer = (data: NameFormValues) => {
    if (officers.includes(data.name)) {
      officerForm.setError('name', { type: 'manual', message: 'This team member already exists.' });
      return;
    }
    addOfficer(data.name);
    toast({ title: 'Team Member Added', description: `${data.name} has been added.` });
    officerForm.reset();
  };

  const handleUpdateOfficer = (originalName: string, data: NameFormValues) => {
    if (data.name !== originalName && officers.includes(data.name)) {
        editOfficerForm.setError('name', { type: 'manual', message: 'This team member already exists.' });
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
  
  const startEditingOfficer = (name: string) => {
    setEditingOfficer(name);
    editOfficerForm.setValue('name', name);
  };

  const cancelEditingOfficer = () => {
    setEditingOfficer(null);
    editOfficerForm.reset();
  };

  // Bank Management Handlers
  const handleAddBank = (data: NameFormValues) => {
    if (banks.includes(data.name)) {
      bankForm.setError('name', { type: 'manual', message: 'This bank already exists.' });
      return;
    }
    addBank(data.name);
    toast({ title: 'Bank Added', description: `${data.name} has been added.` });
    bankForm.reset();
  };

  const handleUpdateBank = (originalName: string, data: NameFormValues) => {
    if (data.name !== originalName && banks.includes(data.name)) {
        editBankForm.setError('name', { type: 'manual', message: 'This bank already exists.' });
        return;
    }
    updateBank(originalName, data.name);
    toast({ title: 'Bank Updated', description: `Updated to ${data.name}.` });
    setEditingBank(null);
  };
  
  const handleRemoveBank = (name: string) => {
    removeBank(name);
    toast({ title: 'Bank Removed', description: `${name} has been removed.`, variant: 'destructive' });
  };
  
  const startEditingBank = (name: string) => {
    setEditingBank(name);
    editBankForm.setValue('name', name);
  };

  const cancelEditingBank = () => {
    setEditingBank(null);
    editBankForm.reset();
  };


  return (
    <>
      <PageHeader title="Settings" description="Manage your application settings." />
      <div className="grid gap-6 md:grid-cols-2">
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
                       <Form {...editOfficerForm}>
                        <form onSubmit={editOfficerForm.handleSubmit((data) => handleUpdateOfficer(officer, data))} className="flex items-center gap-2 flex-1">
                           <FormField
                              control={editOfficerForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl><Input {...field} autoFocus /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                           />
                          <Button type="submit" size="icon" variant="ghost"><Save className="h-4 w-4" /></Button>
                          <Button type="button" size="icon" variant="ghost" onClick={cancelEditingOfficer}><X className="h-4 w-4" /></Button>
                        </form>
                      </Form>
                    ) : (
                      <>
                        <p className="font-medium">{officer}</p>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEditingOfficer(officer)}>
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
              <Form {...officerForm}>
                <form onSubmit={officerForm.handleSubmit(handleAddOfficer)} className="flex items-start gap-2 pt-4 border-t">
                  <FormField
                    control={officerForm.control}
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

        <Card>
          <CardHeader>
            <CardTitle>Banks</CardTitle>
            <CardDescription>Add, edit, or remove banks from your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                {banks.map((bank) => (
                  <div key={bank} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    {editingBank === bank ? (
                       <Form {...editBankForm}>
                        <form onSubmit={editBankForm.handleSubmit((data) => handleUpdateBank(bank, data))} className="flex items-center gap-2 flex-1">
                           <FormField
                              control={editBankForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl><Input {...field} autoFocus /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                           />
                          <Button type="submit" size="icon" variant="ghost"><Save className="h-4 w-4" /></Button>
                          <Button type="button" size="icon" variant="ghost" onClick={cancelEditingBank}><X className="h-4 w-4" /></Button>
                        </form>
                      </Form>
                    ) : (
                      <>
                        <p className="font-medium">{bank}</p>
                        { bank !== 'Other' && (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => startEditingBank(bank)}>
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
                                    This action cannot be undone. This will permanently remove <strong>{bank}</strong> from the banks list.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveBank(bank)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              <Form {...bankForm}>
                <form onSubmit={bankForm.handleSubmit(handleAddBank)} className="flex items-start gap-2 pt-4 border-t">
                  <FormField
                    control={bankForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="sr-only">New Bank</FormLabel>
                        <FormControl>
                           <Input placeholder="Enter new bank name..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" variant="outline">
                    <Landmark className="mr-2" />
                    Add Bank
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

    