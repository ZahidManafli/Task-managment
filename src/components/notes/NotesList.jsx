import NoteCard from './NoteCard';

const NotesList = ({ notes, onEdit, onDelete }) => {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No notes yet. Create your first note to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NotesList;
