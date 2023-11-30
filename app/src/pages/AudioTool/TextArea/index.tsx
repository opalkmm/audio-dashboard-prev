import { Typography, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { COLORS } from 'theme';

/*
    Scrollable text area component
    This component is used to display text in a scrollable area
*/

interface Props {
  text: string;
  scroll?: boolean;
  reset?: boolean;
}

const TextAreaStyled = styled(Typography)`
  width: 100%;
  height: 100%;
  overflow: auto;
  border: 3px solid ${COLORS.highlight};
  border-radius: 14px;
  padding: 10px;
  margin-top: auto;
  font-size: 1.7em;
`;

export const TextArea: React.FC<Props> = ({ text, scroll, reset }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [pauseScrolling, setPauseScrolling] = useState(false);

  const delay = (delayInms: number) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  };

  useEffect(() => {
    if (scroll) {
      const scrollSlowly = async () => {
        ref.current?.scrollBy({ top: 0.5, behavior: 'smooth' });
        await delay(80);
        setScrollPosition((prev) =>
          ref.current?.scrollTop ? ref.current?.scrollTop : prev
        );
      };
      if (!pauseScrolling) scrollSlowly();
    }
  }, [pauseScrolling, scroll, scrollPosition]);

  useEffect(() => {
    if (reset) {
      ref.current?.scrollTo({ top: 0 });
      setPauseScrolling(false);
      setScrollPosition(0);
    }
  }, [reset]);

  return (
    <TextAreaStyled
      whiteSpace={'pre-wrap'}
      onMouseEnter={() => setPauseScrolling(true)}
      onMouseLeave={() => setPauseScrolling(false)}
      ref={ref}
    >
      {text}
    </TextAreaStyled>
  );
};
