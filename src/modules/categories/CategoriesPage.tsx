import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Timestamp } from 'firebase/firestore';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Home,
  Car,
  ShoppingCart,
  Utensils,
  Heart,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Zap,
  Wifi,
  Droplets,
  Phone
} from 'lucide-react';
import { Category } from '@/types/models';

// Mock data for now - in a real app this would come from a hook
const mockCategories: Category[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Alimentación',
    icon: 'Utensils',
    color: '#ef4444',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Transporte',
    icon: 'Car',
    color: '#3b82f6',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '3',
    userId: 'user1',
    name: 'Entretenimiento',
    icon: 'Gamepad2',
    color: '#8b5cf6',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '4',
    userId: 'user1',
    name: 'Servicios',
    icon: 'Zap',
    color: '#f59e0b',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '5',
    userId: 'user1',
    name: 'Salud',
    icon: 'Heart',
    color: '#10b981',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

const iconOptions = [
  { name: 'Home', icon: Home },
  { name: 'Car', icon: Car },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Utensils', icon: Utensils },
  { name: 'Heart', icon: Heart },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Zap', icon: Zap },
  { name: 'Wifi', icon: Wifi },
  { name: 'Droplets', icon: Droplets },
  { name: 'Phone', icon: Phone },
];

const colorOptions = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
];

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Tag',
    color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      // Update existing category
      setCategories(categories =>
        categories.map(category =>
          category.id === editingCategory.id
            ? { ...category, ...formData, updatedAt: Timestamp.now() }
            : category
        )
      );
    } else {
      // Create new category
      const newCategory: Category = {
        id: Date.now().toString(),
        userId: 'user1', // In real app, get from auth
        ...formData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      setCategories([...categories, newCategory]);
    }

    // Reset form
    setFormData({
      name: '',
      icon: 'Tag',
      color: '#3b82f6',
    });
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || 'Tag',
      color: category.color || '#3b82f6',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setCategories(categories => categories.filter(category => category.id !== id));
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.name === iconName);
    return iconOption ? iconOption.icon : Tag;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Tag className="w-8 h-8" />
            Categorías
          </h1>
          <p className="text-muted-foreground">
            Organiza tus transacciones con categorías personalizadas
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Alimentación, Transporte, Entretenimiento"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ícono</label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <button
                        key={iconOption.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconOption.name })}
                        className={`p-3 border rounded-lg hover:bg-muted transition-colors ${
                          formData.icon === iconOption.name ? 'border-primary bg-primary/10' : 'border-border'
                        }`}
                      >
                        <IconComponent className="w-5 h-5 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="grid grid-cols-9 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-400' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingCategory ? 'Actualizar' : 'Crear'} Categoría
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                    setFormData({
                      name: '',
                      icon: 'Tag',
                      color: '#3b82f6',
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon || 'Tag');

          return (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <IconComponent
                        className="w-6 h-6"
                        style={{ color: category.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.icon || 'Sin ícono'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay categorías</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera categoría para organizar mejor tus transacciones.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Categoría
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Uso</CardTitle>
          <CardDescription>
            Cómo se están utilizando tus categorías
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{categories.length}</p>
              <p className="text-sm text-muted-foreground">Categorías Totales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {categories.filter(c => c.icon).length}
              </p>
              <p className="text-sm text-muted-foreground">Con Íconos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {new Set(categories.map(c => c.color)).size}
              </p>
              <p className="text-sm text-muted-foreground">Colores Únicos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}