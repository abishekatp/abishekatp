export type TextStyle = 'body' | 'bold' | 'italic' | 'boldItalic' | 'code' | 'heading' | 'title';

export interface InlineRun {
    text: string;
    style: TextStyle;
}

export interface ContentBlock {
    kind: 'paragraph' | 'heading' | 'quote' | 'list' | 'code' | 'rule';
    runs: InlineRun[];
    depth?: number;
    prefix?: string;
}

export interface CardDocument {
    title: string;
    blocks: ContentBlock[];
    warnings: string[];
}

export interface FontSpec {
    family: string;
    size: number;
    weight: number;
    italic?: boolean;
}

export interface CardTemplate {
    id: string;
    name: string;
    width: number;
    height: number;
    margin: number;
    top: number;
    bottom: number;
    background: string;
    ink: string;
    muted: string;
    accent: string;
    lineHeight: number;
    gap: number;
    fonts: Record<TextStyle, FontSpec>;
}

export interface TextOperation {
    text: string;
    x: number;
    y: number;
    width: number;
    style: TextStyle;
}

export interface CardLayout {
    kind: 'cover' | 'content';
    operations: TextOperation[];
}

export type MeasureText = (text: string, style: TextStyle) => number;