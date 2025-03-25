interface IntroHeaderProps {
  title: string;
  description: string;
}

export default function IntroHeader({ title, description }: IntroHeaderProps) {
  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl font-bold text-text sm:text-4xl mb-4">{title}</h1>
      <p className="max-w-2xl mx-auto text-lg text-gray-600">
        {description.split('never stored!').map((text, i) => 
          i === 0 ? (
            <span key={i}>{text}<span className="font-medium text-primary">never stored!</span></span>
          ) : (
            <span key={i}>{text}</span>
          )
        )}
      </p>
    </div>
  );
}
