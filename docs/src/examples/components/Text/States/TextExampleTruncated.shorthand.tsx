import React from 'react'
import { Text } from '@stardust-ui/react'

const [notTruncatedText, truncatedText] = [
  'Some long text here to see how it looks when not truncated',
  'Some long text here to see how it looks truncated',
].map(text =>
  Array(5)
    .fill(text)
    .join('. '),
)

const TextExampleTruncated = () => (
  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
    <Text content={notTruncatedText} />
    <br />
    <br />
    <Text truncated content={truncatedText} />
  </div>
)

export default TextExampleTruncated
