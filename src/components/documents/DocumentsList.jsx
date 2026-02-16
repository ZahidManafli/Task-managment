import DocumentCard from './DocumentCard';

const DocumentsList = ({ documents, onDownload, onDelete }) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No documents uploaded yet. Upload your first document to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default DocumentsList;
