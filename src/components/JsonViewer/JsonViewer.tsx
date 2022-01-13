import ReactJson from "react-json-view";

interface Props {
  height?: string;
  src: object;
}

export default function JsonViewer(props: Props) {
  const { height, src } = props;
  return (
    <ReactJson
      src={src}
      name={false}
      theme="chalk"
      displayDataTypes={false}
      style={{
        overflow: "auto",
        height: height,
      }}
    />
  );
}
