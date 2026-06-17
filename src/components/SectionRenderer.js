export default function SectionRenderer({ section }) {
  switch (section.type) {
    case 'text':
      return (
        <div className="space-y-2">
          {section.title && <h3 className="text-xl font-bold">{section.title}</h3>}
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.body}</p>
        </div>
      )

    case 'notice':
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          {section.title && <h3 className="font-bold text-amber-900">{section.title}</h3>}
          <p className="text-amber-800 whitespace-pre-line">{section.body}</p>
        </div>
      )

    case 'menu':
      return (
        <div className="space-y-3">
          {section.title && <h3 className="text-xl font-bold">{section.title}</h3>}
          <div className="grid gap-3">
            {section.items?.map((item, i) => (
              <div key={i} className="flex gap-4 bg-white rounded-xl p-4 border">
                {item.image_url && (
                  <div className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${item.image_url})` }} />
                )}
                <div>
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}
