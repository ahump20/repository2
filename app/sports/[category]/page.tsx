import React from "react";
import { sportsCategories } from "../categories";

type Props = {
  params: { category: string };
};

const SportPage = ({ params }: Props) => {
  const category = sportsCategories.find((c) => c.id === params.category);
  if (!category) {
    return <div>Unknown category: {params.category}</div>;
  }
  return (
    <main style={{ padding: 20 }}>
      <h1>{category.name}</h1>
      <p>
        Research and content for {category.name} will appear here as Blaze Intelligence expands its
        coverage.
      </p>
    </main>
  );
};

export default SportPage;
