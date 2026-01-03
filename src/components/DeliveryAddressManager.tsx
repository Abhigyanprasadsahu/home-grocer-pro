import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Plus, Check, Edit2, Trash2, Home, Building, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

interface DeliveryAddressManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress?: (address: Address) => void;
}

const DeliveryAddressManager = ({ isOpen, onClose, onSelectAddress }: DeliveryAddressManagerProps) => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      name: 'John Doe',
      phone: '9876543210',
      addressLine1: '123, Green Park Colony',
      addressLine2: 'Near City Mall',
      city: 'Bangalore',
      pincode: '560001',
      isDefault: true,
    },
    {
      id: '2',
      type: 'work',
      name: 'John Doe',
      phone: '9876543210',
      addressLine1: '456, Tech Park Building A',
      addressLine2: 'Whitefield',
      city: 'Bangalore',
      pincode: '560066',
      isDefault: false,
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id' | 'isDefault'>>({
    type: 'home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    pincode: '',
  });

  const resetForm = () => {
    setFormData({
      type: 'home',
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      pincode: '',
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.addressLine1 || !formData.city || !formData.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingId) {
      setAddresses(prev => prev.map(addr => 
        addr.id === editingId ? { ...addr, ...formData } : addr
      ));
      toast.success('Address updated');
    } else {
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
        isDefault: addresses.length === 0,
      };
      setAddresses(prev => [...prev, newAddress]);
      toast.success('Address added');
    }
    resetForm();
  };

  const handleEdit = (address: Address) => {
    setFormData({
      type: address.type,
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      pincode: address.pincode,
    });
    setEditingId(address.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    toast.success('Address deleted');
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
    toast.success('Default address updated');
  };

  const getTypeIcon = (type: Address['type']) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            Delivery Addresses
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Address Button */}
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add New Address
            </Button>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="p-4 bg-secondary/50 rounded-xl space-y-4">
              <h4 className="font-semibold">{editingId ? 'Edit Address' : 'New Address'}</h4>
              
              {/* Address Type */}
              <div className="flex gap-2">
                {(['home', 'work', 'other'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData(prev => ({ ...prev, type }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${
                      formData.type === type
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {getTypeIcon(type)}
                    <span className="capitalize text-sm">{type}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                  placeholder="House/Flat No., Building Name"
                />
              </div>

              <div>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                  placeholder="Street, Landmark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Bangalore"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="560001"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} variant="hero" className="flex-1">
                  {editingId ? 'Update' : 'Save'} Address
                </Button>
                <Button onClick={resetForm} variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Address List */}
          {!showAddForm && addresses.length > 0 && (
            <div className="space-y-3">
              {addresses.map(address => (
                <div
                  key={address.id}
                  onClick={() => onSelectAddress?.(address)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    address.isDefault
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`p-1.5 rounded-lg ${
                          address.isDefault ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {getTypeIcon(address.type)}
                        </span>
                        <span className="font-semibold capitalize">{address.type}</span>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{address.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.addressLine1}, {address.addressLine2}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.city} - {address.pincode}
                      </p>
                      <p className="text-sm text-muted-foreground">📞 {address.phone}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(address); }}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(address.id); }}
                        className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                      {!address.isDefault && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSetDefault(address.id); }}
                          className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                          title="Set as default"
                        >
                          <Check className="w-4 h-4 text-primary" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!showAddForm && addresses.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No addresses saved</p>
              <p className="text-sm text-muted-foreground">Add an address for faster checkout</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryAddressManager;
