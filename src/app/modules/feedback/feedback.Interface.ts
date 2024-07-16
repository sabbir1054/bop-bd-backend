export interface IFeedbackUpdate {
  rating?: number;
  comment?: string;
}

export interface IFeedbackCreate {
  rating: number;
  comment: string;
  productId: string;
}
