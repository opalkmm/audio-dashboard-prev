import { Modal, Typography, Box, Divider, Button, Stack } from '@mui/material';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  borderRadius: '15px',
  boxShadow: 24,
  p: 4
};

interface Props {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PromptModal: React.FC<Props> = ({
  title,
  description,
  open,
  onClose,
  onConfirm
}) => {
  return (
    <div>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title.toUpperCase()}
          </Typography>
          <Divider sx={{ paddingBottom: '10px' }} />
          <Typography
            id="modal-modal-description"
            sx={{ mt: 2, marginBottom: '10px' }}
          >
            {description}
          </Typography>
          <Divider sx={{ paddingBottom: '10px' }} />
          <Box
            id="action-container"
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              height: '40px',
              margin: '10px 0px'
            }}
          >
            <Stack direction={'row'} spacing={1}>
              <Button variant="text" onClick={onClose}>
                CLOSE
              </Button>
              <Button variant="custom" onClick={onConfirm}>
                OK
              </Button>
            </Stack>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};
