"use client"

import {
  IconBook,
  IconSchool,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react"
import { motion } from "motion/react"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type CardData = {
  title: string
  value: number
  description: string
  icon: string
  color: string
  bgColor: string
  delay: number
}

type SectionCardsClientProps = {
  cards: CardData[]
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  IconUserPlus,
  IconUsers,
  IconSchool,
  IconBook,
}

export function SectionCardsClient({ cards }: SectionCardsClientProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => {
        const Icon = iconMap[card.icon]
        if (!Icon) return null
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: card.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="@container/card group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <motion.div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor} transition-transform duration-300 group-hover:scale-110`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </motion.div>
                  </div>
                  <CardDescription className="text-sm font-medium">
                    {card.title}
                  </CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {card.value}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="relative flex-col items-start gap-1.5 text-sm">
                  <p className="text-muted-foreground">{card.description}</p>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}
