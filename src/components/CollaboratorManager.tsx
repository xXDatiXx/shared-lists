import { useState, useEffect } from 'react';
import { Users, UserPlus, X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllUsers } from '@/lib/auth';
import { getCollaborators, addCollaborator, removeCollaborator, type Collaborator } from '@/lib/api';
import { type User } from '@/lib/auth';

interface CollaboratorManagerProps {
  listId: string;
  creatorId?: string;
  currentUserId: string;
}

export default function CollaboratorManager({ listId, creatorId, currentUserId }: CollaboratorManagerProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const isCreator = creatorId === currentUserId;

  useEffect(() => {
    if (open) {
      loadCollaborators();
      loadUsers();
    }
  }, [open]);

  const loadCollaborators = async () => {
    try {
      const data = await getCollaborators(listId);
      setCollaborators(data);
    } catch (error) {
      console.error('Failed to load collaborators:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleAddCollaborator = async () => {
    if (!selectedUserId) return;
    
    setLoading(true);
    try {
      await addCollaborator(listId, selectedUserId);
      await loadCollaborators();
      setSelectedUserId('');
    } catch (error) {
      console.error('Failed to add collaborator:', error);
      alert('Error al añadir colaborador');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    setLoading(true);
    try {
      await removeCollaborator(listId, userId);
      await loadCollaborators();
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
      alert('Error al eliminar colaborador');
    } finally {
      setLoading(false);
    }
  };

  // Filter out users who are already collaborators or the creator
  const availableUsers = allUsers.filter(
    user => user.id !== creatorId && !collaborators.some(c => c.id === user.id)
  );

  const creator = allUsers.find(u => u.id === creatorId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          <span>Colaboradores</span>
          {collaborators.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {collaborators.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Colaboradores</DialogTitle>
          <DialogDescription>
            {isCreator 
              ? 'Administra quién puede ver y editar esta lista'
              : 'Personas con acceso a esta lista'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Creator */}
          {creator && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Creador</p>
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <span className="text-2xl">{creator.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate flex items-center gap-2">
                    {creator.name}
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </p>
                  <p className="text-xs text-muted-foreground">Propietario</p>
                </div>
              </div>
            </div>
          )}

          {/* Add collaborator (creator only) */}
          {isCreator && availableUsers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Añadir colaborador</p>
              <div className="flex gap-2">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <span>{user.avatar}</span>
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  onClick={handleAddCollaborator}
                  disabled={!selectedUserId || loading}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Collaborators list */}
          {collaborators.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Colaboradores ({collaborators.length})
              </p>
              <div className="space-y-2">
                {collaborators.map(collaborator => (
                  <div
                    key={collaborator.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="text-2xl">{collaborator.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{collaborator.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Añadido {new Date(collaborator.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {isCreator && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {collaborators.length === 0 && !isCreator && (
            <p className="text-sm text-center text-muted-foreground py-4">
              No hay colaboradores adicionales
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
