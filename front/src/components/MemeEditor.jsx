import { useEffect, useRef, useState } from 'react';

const templates = {
  classic: ['#ffcf5a', '#ff6b6b'],
  night: ['#211a3f', '#4ecdc4'],
  mint: ['#b7fff4', '#7c5cbf'],
};

function drawWrappedText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;
    if (context.measureText(nextLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }
  });

  lines.push(line);
  lines.forEach((item, index) => {
    context.strokeText(item, x, y + index * lineHeight);
    context.fillText(item, x, y + index * lineHeight);
  });
}

function drawCoverImage(context, image, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2;

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

export default function MemeEditor() {
  const canvasRef = useRef(null);
  const [template, setTemplate] = useState('classic');
  const [topText, setTopText] = useState('КОГДА СПРИНТ');
  const [bottomText, setBottomText] = useState('ЗАКРЫЛСЯ БЕЗ БАГОВ');
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (backgroundImage) {
      drawCoverImage(context, backgroundImage, canvas.width, canvas.height);
      context.fillStyle = 'rgba(26, 20, 48, 0.18)';
      context.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const [start, end] = templates[template];
      const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);

      gradient.addColorStop(0, start);
      gradient.addColorStop(1, end);
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = 'rgba(26, 20, 48, 0.18)';
      context.beginPath();
      context.arc(150, 170, 90, 0, Math.PI * 2);
      context.arc(470, 220, 125, 0, Math.PI * 2);
      context.fill();
    }

    context.textAlign = 'center';
    context.lineJoin = 'round';
    context.font = '700 42px Arial, sans-serif';
    context.fillStyle = textColor;
    context.strokeStyle = '#1a1430';
    context.lineWidth = 8;

    drawWrappedText(context, topText.toUpperCase(), canvas.width / 2, 82, 520, 48);
    drawWrappedText(context, bottomText.toUpperCase(), canvas.width / 2, 390, 520, 48);
  }, [backgroundImage, bottomText, template, textColor, topText]);

  function selectBackground(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setBackgroundImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => setBackgroundImage(image);
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function clearBackground() {
    setBackgroundImage(null);
  }

  function downloadMeme() {
    const link = document.createElement('a');
    link.download = 'funnyhub-meme.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  return (
    <section className="meme-editor" aria-labelledby="meme-editor-title">
      <div className="meme-editor__head">
        <p className="meme-editor__eyebrow">Meme studio</p>
        <h2 id="meme-editor-title" className="meme-editor__title">
          Редактор мемов
        </h2>
      </div>

      <div className="meme-editor__workspace">
        <canvas ref={canvasRef} width="640" height="480" aria-label="Предпросмотр мема" />
        <div className="meme-editor__controls">
          <label>
            Верхний текст
            <input value={topText} onChange={(event) => setTopText(event.target.value)} />
          </label>
          <label>
            Нижний текст
            <input value={bottomText} onChange={(event) => setBottomText(event.target.value)} />
          </label>
          <label>
            Шаблон
            <select value={template} onChange={(event) => setTemplate(event.target.value)}>
              <option value="classic">Classic</option>
              <option value="night">Night</option>
              <option value="mint">Mint</option>
            </select>
          </label>
          <label>
            Фон мема
            <input accept="image/*" onChange={selectBackground} type="file" />
          </label>
          {backgroundImage ? (
            <button className="meme-editor__button--secondary" type="button" onClick={clearBackground}>
              Убрать фон
            </button>
          ) : null}
          <label>
            Цвет текста
            <input value={textColor} onChange={(event) => setTextColor(event.target.value)} type="color" />
          </label>
          <button type="button" onClick={downloadMeme}>
            Скачать мем
          </button>
        </div>
      </div>
    </section>
  );
}
