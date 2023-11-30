import { useState } from 'react';
import {
  Dialog,
  IconButton,
  DialogContent,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  DialogTitle
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
import { COLORS } from 'theme';
import { AnimatePresence } from 'framer-motion';
import faq from 'data/faq.json';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const FaqModal: React.FC<Props> = ({ open, onClose }) => {
  const [expandedId, setExpandedId] = useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedId(isExpanded ? panel : false);
    };

  return (
    <AnimatePresence key={'audio-tool'}>
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={open}
        onClose={onClose}
        disableEscapeKeyDown
        sx={{
          '.MuiPaper-root': {
            // height: '300px',
            border: `2px solid ${COLORS.highlight}`,
            background: COLORS.paper
          }
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            color: COLORS.highlight
          }}
        >
          <HighlightOffTwoToneIcon />
        </IconButton>
        <DialogTitle
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'center'}
          variant="h4"
        >
          FAQ
        </DialogTitle>
        <DialogContent sx={{ padding: 4 }}>
          <div>
            {faq.map((item, index) => (
              <Accordion
                key={index}
                expanded={expandedId === item.id}
                onChange={handleChange(item.id)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${item.id}-bh-content`}
                  id={`${item.id}-bh-header`}
                >
                  <Typography variant="h5" color={COLORS.secondaryLight}>
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="h6" color={COLORS.highlightLighter}>
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
};
