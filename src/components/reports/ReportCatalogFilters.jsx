import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { DZD_PRICE_STEP_MAJOR, priceUnit10kToMajor } from '../../lib/reportPriceUnits'

function majorToUnit10k(major) {
    return Math.max(0, Number(major) || 0) / DZD_PRICE_STEP_MAJOR
}

/**
 * @param {{
 *   sectors?: { slug: string, name: string }[],
 *   selectedSectorSlugs?: Set<string>,
 *   onToggleSector?: (slug: string) => void,
 *   onSelectAllSectors?: () => void,
 *   onClearSectors?: () => void,
 *   priceRangeUnits: [number, number],
 *   onPriceRangeChange: (range: [number, number]) => void,
 *   maxPriceUnit: number,
 *   showSectorCheckboxes?: boolean,
 *   compact?: boolean,
 *   inline?: boolean,
 * }} props
 */
export default function ReportCatalogFilters({
    sectors = [],
    selectedSectorSlugs = new Set(),
    onToggleSector,
    onSelectAllSectors,
    onClearSectors,
    priceRangeUnits,
    onPriceRangeChange,
    maxPriceUnit = 1,
    showSectorCheckboxes = true,
    compact = false,
    inline = false,
}) {
    const { t } = useTranslation()
    const allSelected = sectors.length > 0 && selectedSectorSlugs.size === sectors.length
    const noneSelected = selectedSectorSlugs.size === 0
    const [minUnit, maxUnit] = priceRangeUnits
    const catalogMax = Math.max(1, Math.ceil(maxPriceUnit || 1))

    return (
        <Stack
            direction={inline && !showSectorCheckboxes ? 'row' : 'column'}
            spacing={inline ? 1 : compact ? 2 : 2.5}
            alignItems={inline ? 'center' : 'stretch'}
            flexWrap={inline ? 'wrap' : 'nowrap'}
            useFlexGap
        >
            {showSectorCheckboxes && sectors.length > 0 && (
                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={800}>
                            {t('reportFilters.sectorsTitle')}
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                            <Button size="small" onClick={onSelectAllSectors} disabled={allSelected}>
                                {t('reportFilters.selectAllSectors')}
                            </Button>
                            <Button size="small" onClick={onClearSectors} disabled={noneSelected}>
                                {t('reportFilters.clearSectors')}
                            </Button>
                        </Stack>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {t('reportFilters.sectorsHint')}
                    </Typography>
                    <FormGroup
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: compact
                                ? { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }
                                : '1fr',
                            maxHeight: compact ? 140 : 200,
                            overflow: 'auto',
                            gap: 0,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            px: 1.5,
                            py: 0.5,
                        }}
                    >
                        {sectors.map(s => (
                            <FormControlLabel
                                key={s.slug}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={selectedSectorSlugs.has(s.slug)}
                                        onChange={() => onToggleSector?.(s.slug)}
                                    />
                                }
                                label={
                                    <Typography variant="body2" noWrap title={s.name}>
                                        {s.name}
                                    </Typography>
                                }
                                sx={{ mx: 0, minWidth: 0 }}
                            />
                        ))}
                    </FormGroup>
                </Box>
            )}

            <Box sx={inline ? { flex: '0 0 auto' } : undefined}>
                <Stack direction="row" spacing={1}>
                    <TextField
                        type="number"
                        size="small"
                        fullWidth={!inline}
                        label={t('reportFilters.minBudget')}
                        sx={inline ? { width: { xs: 100, sm: 110 } } : undefined}
                        value={priceUnit10kToMajor(minUnit)}
                        onChange={e => {
                            const raw = e.target.value
                            const min = raw === '' ? 0 : majorToUnit10k(raw)
                            onPriceRangeChange([min, Math.max(min, maxUnit)])
                        }}
                        inputProps={{ min: 0 }}
                    />
                    <TextField
                        type="number"
                        size="small"
                        fullWidth={!inline}
                        label={t('reportFilters.maxBudget')}
                        sx={inline ? { width: { xs: 100, sm: 110 } } : undefined}
                        value={priceUnit10kToMajor(maxUnit)}
                        onChange={e => {
                            const raw = e.target.value
                            const max = raw === '' ? catalogMax : majorToUnit10k(raw)
                            onPriceRangeChange([Math.min(minUnit, max), max])
                        }}
                        inputProps={{ min: 0 }}
                    />
                </Stack>
            </Box>
        </Stack>
    )
}
