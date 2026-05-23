import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'
import { pageEnter } from './motionPresets'

/** Route-level enter/exit — wrap routes with a layout using this outlet. */
export default function AnimatedOutlet() {
    const location = useLocation()
    const outlet = useOutlet()

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div key={location.pathname} style={{ minHeight: '100%' }} {...pageEnter}>
                {outlet}
            </motion.div>
        </AnimatePresence>
    )
}
