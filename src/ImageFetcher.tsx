import { createSignal, For } from 'solid-js';
import { HStack, InputForm, VStack } from './CommonTool';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ImageFetcher = () => {
  const [images, setImages] = createSignal<string[]>([]);
  const [selectedImages, setSelectedImages] = createSignal<string[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [downloading, setDownloading] = createSignal(false);
  const [error, setError] = createSignal('');

  const corsProxy = 'https://corsproxy.io/?';

  const getProxiedUrl = (url: string) => {
    return corsProxy + encodeURIComponent(url);
  }

  const fetchImages = async (url: string) => {
    setLoading(true);
    setError('');
    setImages([]);
    setSelectedImages([]);

    try {
      const response = await fetch(getProxiedUrl(url));  // URLに対してGETリクエスト
      const htmlText = await response.text();  // HTMLの生データを取得
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // ベースURLを取得
      const baseUrl = new URL(url);
      
      // 画像のURLを全て抽出し、相対パスを絶対パスに変換
      const imgTags = doc.querySelectorAll('img');
      const imageUrls = Array.from(imgTags).map(img => {
        const imgSrc = img.getAttribute('src');
        return imgSrc ? new URL(imgSrc, baseUrl).href : '';
      }).filter(src => src);  // 空のsrcを除外

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

  const getImageFormat = (imgSrc: string) => {
    const extension = imgSrc.split('.').pop()?.toLowerCase();
    if (extension === 'png') return 'PNG';
    if (extension === 'jpeg' || extension === 'jpg') return 'JPEG';
    if (extension === 'webp') return 'WEBP';
    return 'JPEG'; // デフォルトはJPEGとする
  };

  const downloadAsPdf = async () => {
    setDownloading(true);
    const pdf = new jsPDF();
    
    for (let i = 0; i < selectedImages().length; i++) {
      const img = selectedImages()[i];
      const format = getImageFormat(img);

      // 画像を追加 (ページごとに一つずつ)
      if (i > 0) pdf.addPage();
      let width = 180;
      let height = 160;
      
      // 画像をBase64データに変換
      const imgData = await new Promise<string>((resolve, reject) => {
        const imgElement = new Image();
        imgElement.src = getProxiedUrl(img);
        imgElement.crossOrigin = 'Anonymous'; // CORS対応
        imgElement.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = imgElement.width;
          canvas.height = imgElement.height;
          width = imgElement.width;
          height = imgElement.height;
          ctx?.drawImage(imgElement, 0, 0);
          resolve(canvas.toDataURL(`image/${format.toLowerCase()}`));  // JPEGに変換してBase64データを取得
        };
        imgElement.onerror = () => reject('画像の読み込みに失敗しました');
      });

      pdf.addImage(imgData, 'JPEG', 10, 10, 180, 180 * height / width);
    }

    pdf.save('images.pdf');
    setDownloading(false);
  };

  return (
    <VStack alignItems='center' gap='10px' width='100%' height='auto'>
      <h1>サイト内画像列挙ツール</h1>
      <InputForm
        width='min(90%, 500px)'
        gap='0'
        onSubmit={fetchImages}
        placeholder="URLを入力してください"
        buttonText="画像を取得"
      />

      {loading() && <p>読み込み中...</p>}
      {error() && <p>{error()}</p>}

      <div style={{
        display: 'grid',
        "grid-template-columns": 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '16px'
      }}>
        <For each={images()}>{(image, index) => (
          <div 
            style={{ position: 'relative', width: '100%', height: 'auto', cursor: 'pointer' }}
            onClick={() => toggleImageSelection(image)}
          >
            <img 
              src={image} 
              alt={`image ${index() + 1}`} 
              style={{ 
                width: '100%', 
                height: 'auto', 
                display: 'block',
                border: selectedImages().includes(image) ? '2px solid green' : '2px solid transparent',
              }} 
            />
            {selectedImages().includes(image) && (
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                "background-color": 'green',
                color: 'white',
                width: '30px',
                height: '30px',
                display: 'flex',
                "align-items": 'center',
                "justify-content": 'center',
                "border-radius": '50%',
                "font-size": '14px',
                "font-weight": 'bold'
              }}>
                {selectedImages().indexOf(image) + 1}
              </div>
            )}
          </div>
        )}</For>
      </div>

      {selectedImages().length > 0 && (
        <button onClick={downloadAsPdf}>
          選択した画像をPDFとしてダウンロード
        </button>
      )}

      {downloading() && <p>ダウンロード中...</p>}

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
