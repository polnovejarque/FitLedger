import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Plus, Search, Edit, Trash2, Video, Dumbbell } from 'lucide-react';

const Exercises = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('exercises').select('*').eq('coach_id', user.id);
      if (data) setExercises(data);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!name) return alert('Nombre requerido');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const exerciseData = {
      coach_id: user.id,
      name: name.trim(),
      category,
      image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200',
      video_url: videoUrl || null
    };

    if (editingExercise) {
      const { error } = await supabase.from('exercises').update(exerciseData).eq('id', editingExercise.id);
      if (error) alert(error.message);
      else {
        setExercises(exercises.map(ex => ex.id === editingExercise.id ? { ...ex, ...exerciseData } : ex));
        setEditingExercise(null);
      }
    } else {
      const { data, error } = await supabase.from('exercises').insert([exerciseData]).select().single();
      if (error) alert(error.message);
      else setExercises([...exercises, data]);
    }

    setName('');
    setCategory('General');
    setVideoUrl('');
    setShowCreateModal(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar ejercicio?')) return;
    const { error } = await supabase.from('exercises').delete().eq('id', id);
    if (error) alert(error.message);
    else setExercises(exercises.filter(ex => ex.id !== id));
  };

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Biblioteca de Ejercicios</h1>
          <p className="text-zinc-500 tracking-wide">Gestiona tus ejercicios personalizados con videos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
              <Input
                placeholder="Buscar ejercicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
              />
            </div>
          </div>
          <div className="lg:col-span-1">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus size={20} className="mr-2" />
              Nuevo Ejercicio
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="bg-[#111] border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Dumbbell className="text-emerald-500 mr-3" size={24} />
                  <div>
                    <h3 className="text-xl font-semibold text-white">{exercise.name}</h3>
                    <p className="text-zinc-500 text-sm">{exercise.category}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingExercise(exercise);
                      setName(exercise.name);
                      setCategory(exercise.category);
                      setVideoUrl(exercise.video_url || '');
                      setShowCreateModal(true);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(exercise.id)}
                    className="text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              {exercise.video_url && (
                <div className="flex items-center text-zinc-400 text-sm">
                  <Video size={16} className="mr-2" />
                  Video disponible
                </div>
              )}
            </Card>
          ))}
        </div>

        {(showCreateModal || editingExercise) && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <Card className="bg-[#111] border border-zinc-800 rounded-xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-white">
                {editingExercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
              </h2>
              <div className="space-y-4">
                <Input
                  placeholder="Nombre del ejercicio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg p-3"
                >
                  <option value="General">General</option>
                  <option value="Pierna">Pierna</option>
                  <option value="Pecho">Pecho</option>
                  <option value="Espalda">Espalda</option>
                  <option value="Hombro">Hombro</option>
                  <option value="Brazo">Brazo</option>
                  <option value="Core">Core</option>
                </select>
                <Input
                  placeholder="URL del Video (opcional)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="flex space-x-4 mt-6">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {editingExercise ? 'Actualizar' : 'Crear'}
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingExercise(null);
                    setName('');
                    setCategory('General');
                    setVideoUrl('');
                  }}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-zinc-400 hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Exercises;