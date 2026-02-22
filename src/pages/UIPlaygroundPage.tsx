import React, { useState } from 'react';
import { Button, Card, Input } from '@shared/ui/primitives';

export const UIPlaygroundPage: React.FC = () => {
  const [value, setValue] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="mx-auto max-w-6xl space-y-10 py-8">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tight text-fg">
          UI Playground
        </h1>
        <p className="mt-2 text-sm text-muted-fg">
          Visual reference for design tokens, primitives, and interaction states.
        </p>
      </header>

      <Card className="space-y-6 p-6">
        <h2 className="text-xl font-black uppercase text-fg">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="icon button">+</Button>
        </div>
      </Card>

      <Card className="space-y-6 p-6">
        <h2 className="text-xl font-black uppercase text-fg">Inputs</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-fg">
              Text
            </label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type something..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-fg">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-fg">
              Disabled
            </label>
            <Input value="Disabled field" disabled />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-fg">
              Error Example
            </label>
            <Input
              className="border-danger ring-1 ring-danger/20"
              value="invalid@"
              readOnly
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-6 p-6">
        <h2 className="text-xl font-black uppercase text-fg">Surfaces</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="p-4 shadow-none">
            <p className="text-sm font-bold text-fg">Default Surface</p>
            <p className="mt-1 text-xs text-muted-fg">Uses card token styling.</p>
          </Card>
          <Card className="border-primary/30 bg-primary/10 p-4 shadow-none">
            <p className="text-sm font-bold text-primary">Info Surface</p>
            <p className="mt-1 text-xs text-muted-fg">Primary semantic tone.</p>
          </Card>
          <Card className="border-danger/30 bg-danger/10 p-4 shadow-none">
            <p className="text-sm font-bold text-danger">Error Surface</p>
            <p className="mt-1 text-xs text-muted-fg">Danger semantic tone.</p>
          </Card>
        </div>
      </Card>
    </div>
  );
};
