import { motion } from 'framer-motion'
import { ChevronRight, Star, Shield } from 'lucide-react'
import clsx from 'clsx'

interface ProductData {
  id: string
  icon?: React.ElementType
  iconBg?: string
  name: string
  description: string
  discount?: string
  rating?: number
  features?: string[]
  href?: string
  badge?: string
  badgeVariant?: 'orange' | 'blue' | 'green' | 'red'
}

interface ProductCardProps {
  product: ProductData
  index?: number
  onKnowMore?: (product: ProductData) => void
  className?: string
}

const badgeColors: Record<string, string> = {
  orange: 'bg-insurance-orange-100 text-insurance-orange-600',
  blue: 'bg-insurance-blue-100 text-insurance-blue-600',
  green: 'bg-insurance-green-100 text-insurance-green-600',
  red: 'bg-insurance-red-100 text-insurance-red-600',
}

export default function ProductCard({ product, index = 0, onKnowMore, className }: ProductCardProps) {
  const Icon = product.icon || Shield

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className={clsx(
        'group relative overflow-hidden rounded-xl bg-white border border-insurance-dark-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-insurance-orange-200',
        className
      )}
    >
      {/* Discount / Badge */}
      {product.discount && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-gradient-to-r from-insurance-orange-500 to-insurance-red-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
          {product.discount}
        </span>
      )}

      {product.badge && (
        <span className={clsx(
          'absolute left-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
          badgeColors[product.badgeVariant || 'blue']
        )}>
          {product.badge}
        </span>
      )}

      {/* Icon / Image */}
      <div className="flex items-center justify-center pt-8 pb-4">
        <div className={clsx(
          'flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
          product.iconBg || 'from-insurance-orange-400 to-insurance-orange-600'
        )}>
          <Icon className="h-9 w-9 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-6 text-center">
        <h3 className="text-lg font-bold text-insurance-dark-900 group-hover:text-insurance-orange-600 transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-insurance-dark-400 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="mt-3 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={clsx(
                  'h-3.5 w-3.5',
                  i < Math.floor(product.rating!)
                    ? 'fill-insurance-orange-400 text-insurance-orange-400'
                    : 'text-insurance-dark-200'
                )}
              />
            ))}
            <span className="ml-1 text-xs text-insurance-dark-400">{product.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {product.features.slice(0, 3).map((feat) => (
              <span
                key={feat}
                className="rounded-full bg-insurance-blue-50 px-2 py-0.5 text-[10px] font-medium text-insurance-blue-600"
              >
                {feat}
              </span>
            ))}
          </div>
        )}

        {/* Know More */}
        <button
          onClick={() => onKnowMore?.(product)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-insurance-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-insurance-orange-600 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          Know More
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-insurance-orange-500 to-insurance-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </motion.div>
  )
}
