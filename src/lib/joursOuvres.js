import { eachDayOfInterval, isWeekend, format, parseISO } from 'date-fns'

export function compterJoursOuvres(dateDebutISO, dateFinISO, feries, options = {}) {
    const { demiJourDebut = false, demiJourFin = false } = options

    const debut = parseISO(dateDebutISO)
    const fin = parseISO(dateFinISO)

    const tousLesJours = eachDayOfInterval({ start: debut, end: fin })

    const joursOuvres = tousLesJours.filter((jour) => {
        const estWeekend = isWeekend(jour)
        const cleISO = format(jour, 'yyyy-MM-dd')
        const estFerie = feries.has(cleISO)
        return !estWeekend && !estFerie
    })

    let total = joursOuvres.length

    if (total === 0) return 0
    if (demiJourDebut) total -= 0.5
    if (demiJourFin && total > 0.5) total -= 0.5

    return total
}