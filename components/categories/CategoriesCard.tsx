'use client';

import { useState, useEffect, useCallback } from 'react';
import { Categoria, TipoCategoria } from '@/types/categoria';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit2,
  Tag,
  Loader2,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function CategoriesCard() {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Estados para o formulário
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoCategoria>(null);

  // Buscar as categorias do usuário
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categorias');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar categorias');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data as Categoria[]);
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: data.error || 'Erro ao carregar categorias'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível carregar as categorias"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Resetar o formulário
  const resetForm = () => {
    setNome('');
    setTipo(null);
    setIsEditing(false);
    setSelectedCategory(null);
    setErrorMessage(null);
  };

  // Abrir o diálogo para adicionar nova categoria
  const handleAddCategory = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Abrir o diálogo para editar uma categoria
  const handleEditCategory = (category: Categoria) => {
    setSelectedCategory(category);
    setNome(category.nome);
    setTipo(category.tipo);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Preparar para excluir uma categoria
  const handleDeleteCategory = (category: Categoria) => {
    setSelectedCategory(category);
    setErrorMessage(null);
    setIsDeleteDialogOpen(true);
  };

  // Confirmar exclusão de uma categoria
  const confirmDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      const response = await fetch(`/api/categorias?id=${selectedCategory.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Sucesso",
          description: "Categoria excluída com sucesso",
        });
        await fetchCategories();
        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
      } else {
        // Categoria pode estar em uso em transações
        if (response.status === 400 && data.transactionCount) {
          setErrorMessage(`Esta categoria não pode ser removida pois está sendo usada em ${data.transactionCount} transação(ões)`);
        } else {
          setErrorMessage(data.error || 'Erro ao excluir categoria');
        }
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      setErrorMessage('Não foi possível excluir a categoria');
    }
  };

  // Salvar categoria (adicionar ou editar)
  const saveCategory = async () => {
    if (!nome) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Nome da categoria é obrigatório"
      });
      return;
    }

    const categoryData = {
      nome: nome,
      tipo: tipo
    };

    if (isEditing && selectedCategory) {
      // Editar categoria existente
      try {
        const response = await fetch('/api/categorias', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...categoryData,
            id: selectedCategory.id
          })
        });
        
        if (!response.ok) {
          throw new Error('Falha ao atualizar categoria');
        }
        
        const data = await response.json();
        
        if (data.success) {
          toast({
            title: "Sucesso",
            description: "Categoria atualizada com sucesso",
            className: "bg-gradient-to-r from-[#00E980] to-[#00FFBB] text-white"
          });
          await fetchCategories();
          setIsDialogOpen(false);
          resetForm();
        } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: data.error || 'Erro ao atualizar categoria'
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível atualizar a categoria"
        });
      }
    } else {
      // Adicionar nova categoria
      try {
        const response = await fetch('/api/categorias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(categoryData)
        });
        
        if (!response.ok) {
          throw new Error('Falha ao criar categoria');
        }
        
        const data = await response.json();
        
        if (data.success) {
          toast({
            title: "Sucesso",
            description: "Categoria criada com sucesso",
            className: "bg-gradient-to-r from-[#00E980] to-[#00FFBB] text-white"
          });
          await fetchCategories();
          setIsDialogOpen(false);
          resetForm();
        } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: data.error || 'Erro ao criar categoria'
          });
        }
      } catch (error) {
        console.error('Erro ao criar categoria:', error);
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível criar a categoria"
        });
      }
    }
  };

  // Obter cor da badge com base no tipo de categoria
  const getCategoryBadgeColor = (type: TipoCategoria) => {
    switch(type) {
      case 'essencial':
        return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
      case 'futil':
        return 'bg-amber-100 text-amber-600 hover:bg-amber-200';
      case 'investimento':
        return 'bg-green-100 text-green-600 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    }
  };

  return (
    <>
      <Card className="w-full mt-8">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Categorias</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Gerencie suas categorias de transações
            </CardDescription>
          </div>
          <Button 
            onClick={handleAddCategory}
            className="bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Categoria
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Tag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Você não possui categorias cadastradas.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleAddCategory}
              >
                Adicionar primeira categoria
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:border-teal-300 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900 truncate max-w-[150px]">
                        {category.nome}
                      </h3>
                      
                      <Badge 
                        variant="outline" 
                        className={`mt-2 ${getCategoryBadgeColor(category.tipo)}`}
                      >
                        {category.tipo === 'essencial' && 'Essencial'}
                        {category.tipo === 'futil' && 'Fútil'}
                        {category.tipo === 'investimento' && 'Investimento'}
                        {category.tipo === null && 'Sem tipo'}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditCategory(category)}
                        className="h-8 w-8 text-gray-500 hover:text-teal-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteCategory(category)}
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

      {/* Diálogo para adicionar/editar categoria */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Nome da categoria"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo (opcional)</Label>
              <Select 
                value={tipo || undefined} 
                onValueChange={(value) => setTipo(value as TipoCategoria)}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essencial">Essencial</SelectItem>
                  <SelectItem value="futil">Fútil</SelectItem>
                  <SelectItem value="investimento">Investimento</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Classifique suas categorias para facilitar a análise de gastos
              </p>
            </div>
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
              onClick={saveCategory}
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
            {errorMessage ? (
              <div className="flex items-center p-4 mb-4 text-sm rounded-lg bg-red-50 text-red-800">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{errorMessage}</span>
              </div>
            ) : (
              <>
                <p>Tem certeza que deseja excluir esta categoria?</p>
                <p className="mt-2 font-medium text-gray-900">
                  {selectedCategory?.nome}
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedCategory(null);
              }}
            >
              {errorMessage ? 'Fechar' : 'Cancelar'}
            </Button>
            {!errorMessage && (
              <Button 
                variant="destructive" 
                onClick={confirmDeleteCategory}
              >
                Excluir
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
