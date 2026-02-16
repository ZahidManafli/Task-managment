import DocumentCard from './DocumentCard';

const DocumentsList = ({ documents, searchTerm = '', onDownload, onDelete }) => {
  const hasDocuments = documents.length > 0;

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredDocuments = normalizedSearch
    ? documents.filter((doc) => {
        const name = doc.name?.toLowerCase() || '';
        const type = doc.type?.toLowerCase() || '';
        return name.includes(normalizedSearch) || type.includes(normalizedSearch);
      })
    : documents;

  if (!hasDocuments) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No documents uploaded yet. Upload your first document to get started!
        </p>
      </div>
    );
  }

  if (hasDocuments && filteredDocuments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No documents match your search. Try a different name or file type.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredDocuments.map((document) => (
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
