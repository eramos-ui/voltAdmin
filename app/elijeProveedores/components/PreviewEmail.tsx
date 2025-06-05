import { replacePlaceholders } from "@/utils/replacePlaceholders";


interface PreviewEmailProps {
    editableBody: string;
    values: any;
    placeholders: Record<string, string>;
    asuntoPlaceholders: Record<string, string>;
  }
  
  export const PreviewEmail = ({ editableBody, values, placeholders,asuntoPlaceholders }: PreviewEmailProps) => {
    //  console.log('en PreviewEmail editableBody',editableBody);
    //  console.log('en PreviewEmail asuntoPlaceholders',asuntoPlaceholders);
    //  console.log('en PreviewEmail values', values);
    //  console.log('en PreviewEmail placeholders', placeholders);
     if (!placeholders)   return null;

    if (!values.selectedTemplate || !values.proveedoresSelected  ) return null;

    return (
  
            <div className="p-4 max-w-5xl mx-auto bg-white rounded-lg shadow">   
                <div className="border p-4 rounded-md bg-gray-100">
                    <h3 className="font-semibold">📌 Asunto:</h3>
                    <p className="text-gray-800 mb-2">
                        {replacePlaceholders(values.selectedTemplate.subjectTemplate, asuntoPlaceholders)}
                    </p>
            
                    <h3 className="font-semibold">📩 Cuerpo del correo:</h3>
                    <div className="bg-white p-3 rounded text-gray-800 border"
                    dangerouslySetInnerHTML={{ __html: editableBody.replace("{CotizacionURL}", 
                        (placeholders.CotizacionURL)?placeholders.CotizacionURL:'http:\\evolusol\...') }}
                    />
                </div>
            </div>
    );
  };
  