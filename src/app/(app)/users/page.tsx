'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsers, saveUsers, getDestinations } from '@/lib/local-data-service';
import type { User, Destination } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MoreHorizontal, FilePenLine, Trash2, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function MultiSelect({
  options,
  selected,
  onChange,
  className,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between h-auto ${selected.length > 0 ? 'h-auto' : 'h-10'}`}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length > 0 ? selected.map((item) => {
                const label = options.find(opt => opt.value === item)?.label;
                if (!label) return null;
                return (
                  <Badge
                    variant="secondary"
                    key={item}
                    className="mr-1 mb-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnselect(item);
                    }}
                  >
                    {label}
                    <span className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <XCircle className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </span>
                  </Badge>
                )
            }) : "Pilih destinasi..."}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Cari destinasi..." />
          <CommandList>
            <CommandEmpty>Destinasi tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(
                      selected.includes(option.value)
                        ? selected.filter((item) => item !== option.value)
                        : [...selected, option.value]
                    );
                    setOpen(true);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const XCircle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
)

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const { toast } = useToast();

  // State for Add User Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'pengelola'>('pengelola');
  const [newUserAssignedLocations, setNewUserAssignedLocations] = useState<string[]>([]);
  
  // State for Edit User Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editedUserName, setEditedUserName] = useState('');
  const [editedUserRole, setEditedUserRole] = useState<'admin' | 'pengelola'>('pengelola');
  const [editedUserAssignedLocations, setEditedUserAssignedLocations] = useState<string[]>([]);

  useEffect(() => {
    setUsers(getUsers());
    setDestinations(getDestinations());
  }, []);

  const destinationOptions = destinations.map(d => ({ value: d.id, label: d.name}));

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditedUserName(user.name);
    setEditedUserRole(user.role);
    setEditedUserAssignedLocations(user.assignedLocations);
    setIsEditDialogOpen(true);
  }

  const handleUpdateUser = () => {
    if (!editingUser || !editedUserName.trim()) {
      toast({ variant: "destructive", title: "Nama tidak boleh kosong."});
      return;
    }

    const updatedUsers = users.map(u => u.uid === editingUser.uid ? {
      ...u,
      name: editedUserName.trim(),
      role: editedUserRole,
      assignedLocations: editedUserRole === 'admin' ? [] : editedUserAssignedLocations
    } : u);

    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    setIsEditDialogOpen(false);
    toast({ title: "Pengguna Diperbarui", description: `Data untuk ${editedUserName} telah diperbarui.`});
  }

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.uid === userId);
    if (!userToDelete) return;

    const updatedUsers = users.filter(u => u.uid !== userId);
    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    toast({
      title: "Pengguna Dihapus",
      description: `Pengguna "${userToDelete.name}" telah berhasil dihapus.`,
    });
  }
  
  const resetAddForm = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('pengelola');
    setNewUserAssignedLocations([]);
  };

  const handleAddNewUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Input tidak lengkap",
        description: "Harap isi nama, email, dan kata sandi pengguna.",
      });
      return;
    }
    
    // Check for duplicate email
    if (users.some(user => user.email === newUserEmail.trim())) {
      toast({
        variant: "destructive",
        title: "Email sudah ada",
        description: "Email yang Anda masukkan sudah terdaftar.",
      });
      return;
    }

    const newUser: User = {
      uid: `user-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword.trim(),
      role: newUserRole,
      assignedLocations: newUserRole === 'pengelola' ? newUserAssignedLocations : [],
      status: 'aktif',
      avatarUrl: PlaceHolderImages[users.length % PlaceHolderImages.length].imageUrl
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    toast({
      title: "Pengguna Ditambahkan",
      description: `Pengguna "${newUser.name}" berhasil dibuat.`,
    });

    setIsAddDialogOpen(false);
    resetAddForm();
  };

  const statusVariant = {
      aktif: "default",
      nonaktif: "destructive",
  } as const;
  
  const roleVariant = {
      admin: "secondary",
      pengelola: "outline",
  } as const;

  const getAssignedLocationsNames = (locationIds: string[]) => {
    if (locationIds.length === 0) return '-';
    return locationIds.map(id => destinations.find(d => d.id === id)?.name).filter(Boolean).join(', ');
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Pengguna</h1>
        <p className="text-muted-foreground">
          Kelola pengguna (admin dan pengelola) di sini.
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
                <CardTitle>Daftar Pengguna</CardTitle>
                <CardDescription>Berikut adalah daftar semua pengguna yang terdaftar di sistem.</CardDescription>
            </div>
             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Tambah Pengguna
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                  <DialogDescription>
                    Isi detail di bawah ini untuk membuat pengguna baru.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user-name" className="text-right">
                      Nama
                    </Label>
                    <Input
                      id="user-name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="col-span-3"
                      placeholder="Contoh: Budi Santoso"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user-email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="col-span-3"
                      placeholder="budi@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user-password" className="text-right">
                      Kata Sandi
                    </Label>
                    <Input
                      id="user-password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="col-span-3"
                      placeholder="Kata sandi awal"
                    />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user-role" className="text-right">
                      Peran
                    </Label>
                     <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as 'admin' | 'pengelola')}>
                        <SelectTrigger id="user-role" className="col-span-3">
                            <SelectValue placeholder="Pilih Peran" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pengelola" className="capitalize">Pengelola</SelectItem>
                            <SelectItem value="admin" className="capitalize">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  {newUserRole === 'pengelola' && (
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">
                        Kelolaan
                      </Label>
                      <div className="col-span-3">
                        <MultiSelect 
                          options={destinationOptions}
                          selected={newUserAssignedLocations}
                          onChange={setNewUserAssignedLocations}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" onClick={resetAddForm}>Batal</Button>
                  </DialogClose>
                  <Button onClick={handleAddNewUser}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Pengguna</TableHead>
                        <TableHead>Peran</TableHead>
                        <TableHead>Lokasi Kelolaan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(user => {
                      return (
                        <TableRow key={user.uid}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatarUrl} alt={user.name}/>
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div>{user.name}</div>
                                  <div className="text-xs text-muted-foreground">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={roleVariant[user.role]} className="capitalize">{user.role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">
                              {user.role === 'admin' ? 'Semua Destinasi' : getAssignedLocationsNames(user.assignedLocations)}
                            </TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[user.status]} className="capitalize">{user.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <AlertDialog>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                              <span className="sr-only">Buka menu</span>
                                              <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                              <FilePenLine className="mr-2 h-4 w-4" />
                                              <span>Edit</span>
                                          </DropdownMenuItem>
                                          <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Hapus</span>
                                            </DropdownMenuItem>
                                          </AlertDialogTrigger>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tindakan ini akan menghapus pengguna <span className="font-bold">"{user.name}"</span> secara permanen. Tindakan ini tidak dapat diurungkan.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Batal</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUser(user.uid)} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-user-name" className="text-right">
                Nama
              </Label>
              <Input
                id="edit-user-name"
                value={editedUserName}
                onChange={(e) => setEditedUserName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-user-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-user-email"
                type="email"
                value={editingUser?.email || ''}
                className="col-span-3"
                disabled
              />
            </div>
              <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-user-role" className="text-right">
                Peran
              </Label>
                <Select value={editedUserRole} onValueChange={(value) => setEditedUserRole(value as 'admin' | 'pengelola')}>
                  <SelectTrigger id="edit-user-role" className="col-span-3">
                      <SelectValue placeholder="Pilih Peran" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="pengelola" className="capitalize">Pengelola</SelectItem>
                      <SelectItem value="admin" className="capitalize">Admin</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            {editedUserRole === 'pengelola' && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Kelolaan
                </Label>
                <div className="col-span-3">
                  <MultiSelect 
                    options={destinationOptions}
                    selected={editedUserAssignedLocations}
                    onChange={setEditedUserAssignedLocations}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            </DialogClose>
            <Button onClick={handleUpdateUser}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
