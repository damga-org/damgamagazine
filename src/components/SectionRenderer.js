export default function SectionRenderer({ section }) {
  switch (section.type) {
    case 'text':
      return (
        <div>
          {section.title && (
            <h2 className="text-lg font-bold text-brand-charcoal mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-brand-amber rounded-full inline-block" />
              {section.title}
            </h2>
          )}
          <div className="text-brand-charcoal/75 leading-relaxed whitespace-pre-line text-[15px]">
            {section.body}
          </div>
        </div>
      )

    case 'notice':
      return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-6 space-y-3">
          {section.title && (
            <h3 className="font-bold text-amber-900 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              {section.title}
            </h3>
          )}
          <p className="text-amber-800/80 whitespace-pre-line leading-relaxed">{section.body}</p>
        </div>
      )

    case 'menu':
      return (
        <div className="space-y-4">
          {section.title && (
            <h2 className="text-lg font-bold text-brand-charcoal flex items-center gap-2">
              <span className="w-1 h-5 bg-brand-amber rounded-full inline-block" />
              {section.title}
            </h2>
          )}
          <div className="grid gap-4">
            {section.items?.map((item, i) => (
              <div key={i}
                className="flex gap-5 bg-white rounded-2xl p-5 border border-amber-900/5
                           hover:shadow-md hover:border-brand-amber/20 transition-all duration-200">
                {item.image_url && (
                  <div className="w-24 h-24 rounded-xl bg-cover bg-center flex-shrink-0 shadow-sm"
                    style={{ backgroundImage: `url(${item.image_url})` }} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-brand-charcoal">{item.name}</h4>
                    {item.price && (
                      <span className="text-brand-amber font-bold text-sm whitespace-nowrap">
                        {item.price.toLocaleString()}원
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-brand-charcoal/60 mt-1.5 leading-relaxed">{item.description}</p>
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
