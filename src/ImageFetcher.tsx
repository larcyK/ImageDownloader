import { createSignal } from 'solid-js';
import { HStack, InputForm, VStack } from './CommonTool';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ImageFetcher = () => {
  const [images, setImages] = createSignal<string[]>([]);
  const [selectedImages, setSelectedImages] = createSignal<string[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const corsProxy = 'https://corsproxy.io/?';

  const fetchImages = async (url: string) => {
    setLoading(true);
    setError('');
    setImages([]);
    setSelectedImages([]);

    try {
      const response = await fetch(corsProxy + encodeURIComponent(url));  // URLに対してGETリクエスト
      const htmlText = await response.text();  // HTMLの生データを取得
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // 画像のURLを全て抽出
      const imgTags = doc.querySelectorAll('img');
      const imageUrls = Array.from(imgTags).map(img => img.src);

      if (imageUrls.length === 0) throw new Error('画像が見つかりませんでした');

      setImages(imageUrls);
    } catch (err) {
      setError('画像の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleImageSelection = (imgSrc: string) => {
    setSelectedImages((prevSelected) => {
      if (prevSelected.includes(imgSrc)) {
        // すでに選択されていた場合は解除
        return prevSelected.filter(img => img !== imgSrc);
      } else {
        // 選択されていない場合は追加
        return [...prevSelected, imgSrc];
      }
    });
  };

  const downloadAsPdf = async () => {
    const pdf = new jsPDF();
    
    for (let i = 0; i < selectedImages().length; i++) {
      const img = selectedImages()[i];
      
      // 画像を追加 (ページごとに一つずつ)
      if (i > 0) pdf.addPage();
      
      // Canvasを使って画像をPDFに追加する
      const imgElement = document.createElement('img');
      imgElement.src = img;
      document.body.appendChild(imgElement); // 一時的にDOMに追加
      await html2canvas(imgElement).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg');
        pdf.addImage(imgData, 'JPEG', 10, 10, 180, 160);
      });
      document.body.removeChild(imgElement); // DOMから削除
    }

    pdf.save('images.pdf');
  };

  return (
    <VStack alignItems='center' gap='10px' width='100%' height='auto'>
      <h1>サイト内画像列挙ツール</h1>
      {/* <form onSubmit={fetchImages}>
        <input
          type="text"
          placeholder="URLを入力してください"
          value={url()}
          onInput={(e) => setUrl(e.currentTarget.value)}
        />
        <button type="submit">画像を取得</button>
      </form> */}
      <InputForm
        width='min(90%, 500px)'

        gap='0'
        onSubmit={fetchImages}
        placeholder="URLを入力してください"
        buttonText="画像を取得"
      />

      {loading() && <p>読み込み中...</p>}
      {error() && <p>{error()}</p>}

      <div style={{ display: 'flex', "flex-wrap": 'wrap' }}>
        {images().map((imgSrc) => (
          <div
            key={imgSrc}
            onClick={() => toggleImageSelection(imgSrc)}
            style={{
              border: selectedImages().includes(imgSrc) ? '2px solid blue' : '2px solid transparent',
              padding: '5px',
              cursor: 'pointer'
            }}
          >
            <img src={imgSrc} alt="Fetched Image" style={{ width: '100px', height: '100px' }} />
          </div>
        ))}
      </div>

      {selectedImages().length > 0 && (
        <button onClick={downloadAsPdf}>
          選択した画像をPDFとしてダウンロード
        </button>
      )}

      <h2>選択された画像</h2>
      <ul>
        {selectedImages().map((imgSrc) => (
          <li key={imgSrc}>
            <img src={imgSrc} alt="Selected Image" style={{ width: '50px', height: '50px', margin: '5px' }} />
          </li>
        ))}
      </ul>
    </VStack>
  );
};

export default ImageFetcher;
