import mongoose, { Schema, Document } from 'mongoose';

export interface IForm extends Document {
  formId: number; // equivalente al id SQL
  name: string;
  valid: boolean;
  jsonForm: any; // o puedes tipar esto más adelante si tienes una estructura clara
}

const FormSchema = new Schema<IForm>({
  formId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  valid: { type: Boolean, required: true },
  jsonForm: { type: Schema.Types.Mixed, required: true },
});

export default mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema);