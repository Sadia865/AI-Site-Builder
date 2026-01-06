import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
  useState
} from 'react';
import type { Project } from '../types';
import { iframeScript } from '../assets/assets';
import EditorPanel from './EditorPanel';

interface ProjectPreviewProps {
  project: Project;
  isGenerating: boolean;
  device?: 'phone' | 'desktop' | 'tablet';
  showEditorPanel?: boolean;
}

export interface ProjectPreviewRef {
  getCode: () => string | undefined;
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(
  ({ project, isGenerating, device = 'desktop', showEditorPanel = true }, ref) => {
    const [selectedElement, setSelectedElement] = useState<any>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const resolution = {
      phone: 'w-[412px]',
      tablet: 'w-[768px]',
      desktop: 'w-full',
    };

    // Imperative handle to get code & remove selection classes
    useImperativeHandle(ref, () => ({
      getCode: () => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc) return undefined;

        // Remove selection classes/attributes
        doc.querySelectorAll('.ai-selected-element,[data-ai-selected]').forEach((el) => {
          el.classList.remove('ai-selected-element');
          el.removeAttribute('data-ai-selected');
          (el as HTMLElement).style.outline=''
        });
        // Remove Injected style from the script from the document
        const previewStyle=doc.getElementById('ai-preview-style');
        if(previewStyle) previewStyle.remove();
         const previewScript=doc.getElementById('ai-preview-script');
         if(previewScript) previewScript.remove()

            // Serialize clean html
            const html=doc.documentElement.outerHTML;
            return html;

        return project.current_code;
      }
    }));

    // Listen for messages from iframe
    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'ELEMENT_SELECTED') {
          setSelectedElement(event.data.payload);
        } else if (event.data.type === 'CLEAR_SELECTION') {
          setSelectedElement(null);
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Handle updates from EditorPanel
    const handleUpdate = (updates: any) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'UPDATE_ELEMENT', payload: updates },
          '*'
        );
      }
    };

    // Prepare complete HTML for iframe
    const getCompleteHtml = (html: string): string => {
      if (!html || html.trim() === '') {
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Empty Project</title>
              <style>
                body {
                  margin: 0;
                  padding: 40px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: #f8fafc;
                  color: #334155;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                }
                .empty-state {
                  text-align: center;
                  max-width: 400px;
                }
                .empty-state h1 { color: #64748b; margin-bottom: 16px; }
                .empty-state p { color: #94a3b8; line-height: 1.6; }
              </style>
            </head>
            <body>
              <div class="empty-state">
                <h1>No Content Yet</h1>
                <p>Generate or edit your website to see the preview here.</p>
              </div>
              ${showEditorPanel ? iframeScript : ''}
            </body>
          </html>
        `;
      }

      if (!html.includes('<html')) {
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${project.name || 'Website'}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
              </style>
            </head>
            <body>
              ${html}
              ${showEditorPanel ? iframeScript : ''}
            </body>
          </html>
        `;
      } else if (html.includes('</body>') && showEditorPanel) {
        html = html.replace('</body>', `${iframeScript}</body>`);
      } else if (showEditorPanel) {
        html += iframeScript;
      }

      return html;
    };

    // Load iframe content
    useEffect(() => {
      if (!iframeRef.current) return;
      const html = getCompleteHtml(project.current_code || '');
      iframeRef.current.srcdoc = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.srcdoc = html;
          console.log('Iframe content updated:', project.id);
        }
      }, 10);
    }, [project.current_code, project.id, showEditorPanel]);

    const handleIframeLoad = () => setIframeLoaded(true);
    const handleIframeError = () => setIframeLoaded(false);

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
        {/* Iframe Preview */}
        <div className="relative w-full h-full flex items-center justify-center">
          <iframe
            key={`${project.id}-${iframeLoaded}`}
            ref={iframeRef}
            sandbox="allow-scripts allow-same-origin allow-forms"
            className={`bg-white rounded-xl shadow-xl h-full transition-all ${resolution[device]}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`Preview - ${project.name}`}
          />

          {!iframeLoaded && !isGenerating && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-xl">
              <div className="text-white text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Loading preview...</p>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
                <div className="text-white text-sm font-medium">Generating preview...</div>
                <p className="text-gray-300 text-xs mt-1">Please wait</p>
              </div>
            </div>
          )}
        </div>

        {/* Editor Panel */}
        {showEditorPanel && selectedElement && (
          <EditorPanel
            selectedElement={selectedElement}
            onUpdate={handleUpdate}
            onClose={() => {
              setSelectedElement(null);
              if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                  { type: 'CLEAR_SELECTION_REQUEST' },
                  '*'
                );
              }
            }}
          />
        )}
      </div>
    );
  }
);

ProjectPreview.displayName = 'ProjectPreview';

export default ProjectPreview;
