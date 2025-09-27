'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lembrete } from '@/types/lembrete';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertCircle,
  Bell,
  Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function RemindersCard() {
  const [reminders, setReminders] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Lembrete | null>(null);
  const { toast } = useToast();

  // Estados para o formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hour, setHour] = useState('12');
  const [recurrenceType, setRecurrenceType] = useState<string | undefined>(undefined);
  const [isRecurrent, setIsRecurrent] = useState(false);

  // Buscar os lembretes do usuário
  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lembretes');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar lembretes');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setReminders(data.data as Lembrete[]);
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: data.error || 'Erro ao carregar lembretes'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar lembretes:', error);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível carregar os lembretes"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Resetar o formulário
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setHour('12');
    setRecurrenceType(undefined);
    setIsRecurrent(false);
    setIsEditing(false);
    setSelectedReminder(null);
  };

  const handleAddReminder = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditReminder = (reminder: Lembrete) => {
    setSelectedReminder(reminder);
    setTitle(reminder.titulo);
    setDescription(reminder.descricao || '');
    setDate(reminder.data_lembrete);
    setHour(reminder.hour.toString());
    setRecurrenceType(reminder.recorrente_tipo || undefined);
    setIsRecurrent(reminder.recorrente_ativo);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteReminder = (reminder: Lembrete) => {
    setSelectedReminder(reminder);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteReminder = async () => {
    if (!selectedReminder) return;
    
    try {
      const response = await fetch(`/api/lembretes?id=${selectedReminder.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao excluir lembrete');
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Lembrete excluído com sucesso",
        });
        await fetchReminders();
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: data.error || 'Erro ao excluir lembrete'
        });
      }
    } catch (error) {
      console.error('Erro ao excluir lembrete:', error);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível excluir o lembrete"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedReminder(null);
    }
  };

  const saveReminder = async () => {
    if (!title || !date) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Título e data são obrigatórios"
      });
      return;
    }

    const reminderData = {
      titulo: title,
      descricao: description,
      data_lembrete: date,
      hour: parseInt(hour),
      recorrente_tipo: isRecurrent ? recurrenceType : undefined,
      recorrente_ativo: isRecurrent
    };

    if (isEditing && selectedReminder) {
      try {
        const response = await fetch('/api/lembretes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...reminderData,
            id: selectedReminder.id
          })
        });
        
        if (!response.ok) {
          throw new Error('Falha ao atualizar lembrete');
        }
        
        const data = await response.json();
        
        if (data.success) {
          toast({
            title: "Sucesso",
            description: "Lembrete atualizado com sucesso",
            className: "bg-gradient-to-r from-[#00E980] to-[#00FFBB] text-white"
          });
          await fetchReminders();
          setIsDialogOpen(false);
          resetForm();
        } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: data.error || 'Erro ao atualizar lembrete'
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar lembrete:', error);
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível atualizar o lembrete"
        });
      }
    } else {
      try {
        const response = await fetch('/api/lembretes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reminderData)
        });
        
        if (!response.ok) {
          throw new Error('Falha ao criar lembrete');
        }
        
        const data = await response.json();
        
        if (data.success) {
          toast({
            title: "Sucesso",
            description: "Lembrete criado com sucesso",
            className: "bg-gradient-to-r from-[#00E980] to-[#00FFBB] text-white"
          });
          await fetchReminders();
          setIsDialogOpen(false);
          resetForm();
        } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: data.error || 'Erro ao criar lembrete'
          });
        }
      } catch (error) {
        console.error('Erro ao criar lembrete:', error);
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível criar o lembrete"
        });
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return dateStr;
    }
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <>
      <Card className="w-full mt-8">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Lembretes</CardTitle>
          <Button 
            onClick={handleAddReminder}
            className="bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Lembrete
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Você não possui lembretes cadastrados.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleAddReminder}
              >
                Adicionar primeiro lembrete
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div 
                  key={reminder.id} 
                  className={`p-4 rounded-lg border ${
                    reminder.enviado ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 shadow-sm'
                  } hover:border-teal-300 transition-colors`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {reminder.enviado ? (
                          <CheckCircle2 className="w-5 h-5 text-teal-500 mr-2" />
                        ) : (
                          <Bell className="w-5 h-5 text-amber-500 mr-2" />
                        )}
                        <h3 className="font-medium text-gray-900">{reminder.titulo}</h3>
                      </div>
                      
                      {reminder.descricao && (
                        <p className="mt-1 text-gray-600 text-sm pl-7">{reminder.descricao}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" /> 
                          {formatDate(reminder.data_lembrete)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" /> 
                          {reminder.hour.toString().padStart(2, '0')}:00h
                        </span>
                        {reminder.recorrente_ativo && (
                          <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" /> 
                            {reminder.recorrente_tipo === 'diario' && 'Diário'}
                            {reminder.recorrente_tipo === 'semanal' && 'Semanal'}
                            {reminder.recorrente_tipo === 'mensal' && 'Mensal'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditReminder(reminder)}
                        className="h-8 w-8 text-gray-500 hover:text-teal-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteReminder(reminder)}
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para adicionar/editar lembrete */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Lembrete' : 'Novo Lembrete'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Título do lembrete"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descrição do lembrete"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hour">Hora</Label>
                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger id="hour">
                    <SelectValue placeholder="Selecionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {hourOptions.map((h) => (
                      <SelectItem key={h} value={h}>{h}:00h</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="recurrent"
                checked={isRecurrent}
                onCheckedChange={setIsRecurrent}
              />
              <Label htmlFor="recurrent">Lembrete recorrente</Label>
            </div>
            
            {isRecurrent && (
              <div className="space-y-2">
                <Label htmlFor="recurrenceType">Tipo de recorrência</Label>
                <Select 
                  value={recurrenceType} 
                  onValueChange={setRecurrenceType}
                >
                  <SelectTrigger id="recurrenceType">
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={saveReminder}
              className="bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500"
            >
              {isEditing ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir este lembrete?</p>
            <p className="mt-2 font-medium text-gray-900">
              {selectedReminder?.titulo}
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteReminder}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
